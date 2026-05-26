package com.example.backend.review.service;

import com.example.backend.admin.review.dto.AdminReplyRequest;
import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.product.repository.ProductVariantRepository;
import com.example.backend.review.dto.ReviewRequest;
import com.example.backend.review.dto.ReviewResponse;
import com.example.backend.review.dto.ReviewSummaryResponse;
import com.example.backend.review.entity.Review;
import com.example.backend.review.entity.ReviewImage;
import com.example.backend.review.entity.ReviewStatus;
import com.example.backend.review.repository.ReviewRepository;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ForbiddenException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository         reviewRepository;
    private final ProductRepository        productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository           userRepository;
    private final FileStorageService       fileStorageService;

    private static final int MAX_IMAGES_PER_REVIEW = 5;

    //PUBLIC
    public PageResponse<ReviewResponse> getProductReviews(
            Long productId, Integer rating, int page, int size) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());

        Page<Review> result = (rating != null)
                ? reviewRepository.findByProductIdAndStatusAndRating(
                productId, ReviewStatus.VISIBLE, rating, pageable)
                : reviewRepository.findByProductIdAndStatus(
                productId, ReviewStatus.VISIBLE, pageable);

        return PageResponse.from(result, ReviewResponse::from);
    }

    public ReviewSummaryResponse getReviewSummary(Long productId) {
        Double avg   = reviewRepository.avgRatingByProductId(productId);
        long   total = reviewRepository.countByProductIdAndStatus(
                productId, ReviewStatus.VISIBLE);

        List<Object[]> rows      = reviewRepository.countByRatingForProduct(productId);
        Map<Integer, Long> breakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++) breakdown.put(i, 0L);
        for (Object[] row : rows) {
            breakdown.put((Integer) row[0], (Long) row[1]);
        }

        ReviewSummaryResponse summary = new ReviewSummaryResponse();
        summary.setAvgRating(Math.round(avg * 10.0) / 10.0);
        summary.setTotalReviews(total);
        summary.setBreakdown(breakdown);
        return summary;
    }

    //USER

    @Transactional
    public ReviewResponse createReview(String username,
                                       Long productId,
                                       ReviewRequest request,
                                       List<MultipartFile> images) {
        User user = findUser(username);

        validateCreateRequest(request);

        ProductVariant variant = findVariant(request.getVariantId());
        Product        product = variant.getProduct();

        if (!product.getId().equals(productId)) {
            throw new RuntimeException("Biến thể sản phẩm không thuộc về sản phẩm này!");
        }

        if (reviewRepository.existsByUserIdAndVariantId(user.getId(), variant.getId())) {
            throw new RuntimeException(
                    "Bạn đã đánh giá sản phẩm này rồi! Hãy chỉnh sửa review cũ.");
        }

        Review review = new Review();
        review.setProduct(product);
        review.setVariant(variant);
        review.setUser(user);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved;
        try {
            saved = reviewRepository.saveAndFlush(review);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi! Hãy chỉnh sửa review cũ.");
        }

        if (images != null && !images.isEmpty()) {
            if (images.size() > MAX_IMAGES_PER_REVIEW) {
                throw new RuntimeException("Mỗi review tối đa " + MAX_IMAGES_PER_REVIEW + " ảnh!");
            }
            try {
                attachImages(saved, images);
                saved = reviewRepository.saveAndFlush(saved);
            } catch (Exception e) {
                if (saved.getImages() != null) {
                    saved.getImages().forEach(img -> fileStorageService.delete(img.getFilePath()));
                }
                throw new RuntimeException("Lỗi khi tải ảnh lên: " + e.getMessage());
            }
        }
        updateProductRating(product);
        return ReviewResponse.from(saved);
    }

    @Transactional
    public ReviewResponse updateReview(String username,
                                       Long productId,
                                       Long reviewId,
                                       ReviewRequest request,
                                       List<MultipartFile> newImages) {
        Review review = findReviewAndCheckOwner(reviewId, username);

        if (!review.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Đánh giá này không thuộc về sản phẩm đang chọn!");
        }

        validateUpdateRequest(request);

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        if (newImages != null && !newImages.isEmpty()) {

            int current = (review.getImages() != null) ? review.getImages().size() : 0;
            if (current + newImages.size() > MAX_IMAGES_PER_REVIEW) {
                throw new RuntimeException(
                        "Mỗi review tối đa " + MAX_IMAGES_PER_REVIEW + " ảnh! " +
                                "Bạn còn chỗ cho " + (MAX_IMAGES_PER_REVIEW - current) + " ảnh.");
            }
            attachImages(review, newImages);
        }

        Review saved = reviewRepository.save(review);
        updateProductRating(review.getProduct());
        return ReviewResponse.from(saved);
    }

    @Transactional
    public void deleteReviewImage(String username, Long productId, Long reviewId, Long imageId) {
        Review review = findReviewAndCheckOwner(reviewId, username);

        if (!review.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Đánh giá này không thuộc về sản phẩm đang chọn!");
        }

        ReviewImage img = review.getImages().stream()
                .filter(i -> i.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh id: " + imageId));

        fileStorageService.delete(img.getFilePath());
        review.getImages().remove(img);
        reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(String username, Long productId, Long reviewId) {
        Review review = findReviewAndCheckOwner(reviewId, username);

        if (!review.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Đánh giá này không thuộc về sản phẩm đang chọn!");
        }

        deleteReviewFiles(review);
        reviewRepository.delete(review);
        updateProductRating(review.getProduct());
    }

    //ADMIN

//    public PageResponse<ReviewResponse> getAllReviewsForAdmin(
//            Long productId, int page, int size) {
//        Pageable pageable = PageRequest.of(page, size,
//                Sort.by("createdAt").descending());
//        Page<Review> result = reviewRepository.findAllForAdmin(productId, pageable);
//        return PageResponse.from(result, ReviewResponse::from);
//    }

    @Transactional
    public ReviewResponse toggleVisibility(Long reviewId) {
        Review review = findReviewOrThrow(reviewId);
        review.setStatus(review.getStatus() == ReviewStatus.VISIBLE
                ? ReviewStatus.HIDDEN
                : ReviewStatus.VISIBLE);
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse replyReview(Long reviewId, AdminReplyRequest request) {
        if (request.getReply() == null || request.getReply().isBlank()) {
            throw new RuntimeException("Nội dung reply không được để trống!");
        }
        Review review = findReviewOrThrow(reviewId);
        review.setAdminReply(request.getReply().trim());
        review.setAdminRepliedAt(LocalDateTime.now());
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public void adminDeleteReview(Long reviewId) {
        Review review = findReviewOrThrow(reviewId);
        deleteReviewFiles(review);
        reviewRepository.delete(review);
        updateProductRating(review.getProduct());
    }

    // HELPER

    private void validateCreateRequest(ReviewRequest request) {
        if (request.getVariantId() == null) {
            throw new RuntimeException("Thiếu variantId!");
        }
        validateRatingAndComment(request);
    }


    private void validateUpdateRequest(ReviewRequest request) {
        validateRatingAndComment(request);
    }

    private void validateRatingAndComment(ReviewRequest request) {
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5 sao!");
        }
        if (request.getComment() != null && request.getComment().length() > 2000) {
            throw new RuntimeException("Nội dung review tối đa 2000 ký tự!");
        }
    }

    private void attachImages(Review review, List<MultipartFile> files) {

        int order = (review.getImages() != null) ? review.getImages().size() : 0;
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            String[] stored = fileStorageService.storeReviewImage(file);
            review.getImages().add(new ReviewImage(review, stored[0], stored[1], order++));
        }
    }

    private void updateProductRating(Product product) {
        Product lockedProduct = productRepository.findByIdForUpdate(product.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + product.getId()));

        Double avg = reviewRepository.avgRatingByProductId(product.getId());
        long   cnt = reviewRepository.countByProductIdAndStatus(
                product.getId(), ReviewStatus.VISIBLE);

        lockedProduct.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        lockedProduct.setReviewCount((int) cnt);
        productRepository.save(lockedProduct);
    }

    private void deleteReviewFiles(Review review) {
        if (review.getImages() != null) {
            review.getImages().forEach(img -> fileStorageService.delete(img.getFilePath()));
        }
    }

    private Review findReviewOrThrow(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy review id: " + reviewId));
    }

    private Review findReviewAndCheckOwner(Long reviewId, String username) {
        Review review = findReviewOrThrow(reviewId);
        if (!review.getUser().getUsername().equals(username)) {
            throw new ForbiddenException("Bạn không có quyền chỉnh sửa review này!");
        }
        return review;
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại!"));
    }

    private ProductVariant findVariant(Long variantId) {
        return variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy variant id: " + variantId));
    }
}
package com.example.backend.admin.review.service;

import com.example.backend.admin.review.dto.*;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.product.entity.Product;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.product.dto.PageResponse;
import com.example.backend.review.entity.Review;
import com.example.backend.review.entity.ReviewStatus;
import com.example.backend.review.repository.ReviewRepository;
import com.example.backend.review.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    // 1. Thống kê tổng quan

    @Transactional(readOnly = true)
    public AdminReviewStatsResponse getStats() {
        long total = reviewRepository.count();
        long visible = reviewRepository.countByStatus(ReviewStatus.VISIBLE);
        long hidden = reviewRepository.countByStatus(ReviewStatus.HIDDEN);
        long withImages = reviewRepository.countReviewsWithImages();
        long withReply = reviewRepository.countReviewsWithReply();
        long noReply = reviewRepository.countVisibleReviewsWithNoReply();
        Double avg = reviewRepository.avgRatingAllProducts();

        // Phân bố sao toàn hệ thống
        Map<Integer, Long> breakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++)
            breakdown.put(i, 0L);
        reviewRepository.countAllByRating()
                .forEach(row -> breakdown.put((Integer) row[0], (Long) row[1]));

        AdminReviewStatsResponse stats = new AdminReviewStatsResponse();
        stats.setTotalReviews(total);
        stats.setVisibleReviews(visible);
        stats.setHiddenReviews(hidden);
        stats.setReviewsWithImages(withImages);
        stats.setReviewsWithReply(withReply);
        stats.setReviewsNoReply(noReply);
        stats.setRatingBreakdown(breakdown);
        stats.setAvgRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        return stats;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminReviewResponse> getReviews(AdminReviewFilterRequest filter) {
        Pageable pageable = buildPageable(filter);
        ReviewStatus status = parseStatus(filter.getStatus());
        Boolean hasImages = parseType(filter.getType(), "with_image");
        Boolean hasReply = parseType(filter.getType(), "with_reply");

        if ("no_reply".equalsIgnoreCase(filter.getType())) {
            hasReply = false;
        }

        Page<Review> page = reviewRepository.filterForAdmin(
                filter.getProductId(),
                status,
                filter.getRating(),
                nullIfBlank(filter.getKeyword()),
                hasImages,
                hasReply,
                pageable);

        return PageResponse.from(page, AdminReviewResponse::from);
    }

    @Transactional(readOnly = true)
    public AdminReviewResponse getReviewDetail(Long reviewId) {
        return AdminReviewResponse.from(findReview(reviewId));
    }

    @Transactional
    public AdminReviewResponse hideReview(Long reviewId) {
        Review review = findReview(reviewId);
        if (review.getStatus() == ReviewStatus.HIDDEN) {
            throw new RuntimeException("Review này đã bị ẩn rồi!");
        }
        review.setStatus(ReviewStatus.HIDDEN);
        Review saved = reviewRepository.save(review);
        updateProductRating(review.getProduct());
        log.info("[Admin] Ẩn review id={}", reviewId);
        return AdminReviewResponse.from(saved);
    }

    @Transactional
    public AdminReviewResponse showReview(Long reviewId) {
        Review review = findReview(reviewId);
        if (review.getStatus() == ReviewStatus.VISIBLE) {
            throw new RuntimeException("Review này đang hiển thị rồi!");
        }
        review.setStatus(ReviewStatus.VISIBLE);
        Review saved = reviewRepository.save(review);
        updateProductRating(review.getProduct());
        log.info("[Admin] Hiện review id={}", reviewId);
        return AdminReviewResponse.from(saved);
    }

    @Transactional
    public AdminReviewResponse toggleVisibility(Long reviewId) {
        Review review = findReview(reviewId);
        review.setStatus(review.getStatus() == ReviewStatus.VISIBLE
                ? ReviewStatus.HIDDEN
                : ReviewStatus.VISIBLE);
        Review saved = reviewRepository.save(review);
        updateProductRating(review.getProduct());
        return AdminReviewResponse.from(saved);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = findReview(reviewId);
        Product product = review.getProduct();

        // Xóa file ảnh vật lý
        if (review.getImages() != null) {
            review.getImages().forEach(img -> fileStorageService.delete(img.getFilePath()));
        }

        reviewRepository.delete(review);
        updateProductRating(product);
        log.info("[Admin] Xóa review id={}", reviewId);
    }

    @Transactional
    public AdminReviewResponse replyReview(Long reviewId, AdminReplyRequest request) {
        if (request.getReply() == null || request.getReply().isBlank()) {
            throw new RuntimeException("Nội dung reply không được để trống!");
        }
        if (request.getReply().length() > 1000) {
            throw new RuntimeException("Nội dung reply tối đa 1000 ký tự!");
        }

        Review review = findReview(reviewId);
        review.setAdminReply(request.getReply().trim());
        review.setAdminRepliedAt(LocalDateTime.now());

        log.info("[Admin] Reply review id={}", reviewId);
        return AdminReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public AdminReviewResponse updateReply(Long reviewId, AdminReplyRequest request) {
        Review review = findReview(reviewId);

        if (review.getAdminReply() == null) {
            throw new RuntimeException("Review này chưa có reply! Hãy dùng POST để tạo reply mới.");
        }
        if (request.getReply() == null || request.getReply().isBlank()) {
            throw new RuntimeException("Nội dung reply không được để trống!");
        }
        if (request.getReply().length() > 1000) {
            throw new RuntimeException("Nội dung reply tối đa 1000 ký tự!");
        }

        review.setAdminReply(request.getReply().trim());
        review.setAdminRepliedAt(LocalDateTime.now());
        return AdminReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public AdminReviewResponse deleteReply(Long reviewId) {
        Review review = findReview(reviewId);

        if (review.getAdminReply() == null) {
            throw new RuntimeException("Review này chưa có reply nào!");
        }

        review.setAdminReply(null);
        review.setAdminRepliedAt(null);
        log.info("[Admin] Xóa reply của review id={}", reviewId);
        return AdminReviewResponse.from(reviewRepository.save(review));
    }

    @Transactional
    public BulkReviewActionResponse bulkAction(BulkReviewActionRequest request) {
        if (request.getReviewIds() == null || request.getReviewIds().isEmpty()) {
            throw new RuntimeException("Danh sách review không được để trống!");
        }
        if (request.getAction() == null || request.getAction().isBlank()) {
            throw new RuntimeException("Thiếu trường 'action'!");
        }

        int success = 0;
        int fail = 0;
        List<String> errors = new ArrayList<>();

        for (Long reviewId : request.getReviewIds()) {
            try {
                switch (request.getAction().toUpperCase()) {
                    case "HIDE" -> hideReview(reviewId);
                    case "SHOW" -> showReview(reviewId);
                    case "DELETE" -> deleteReview(reviewId);
                    default -> throw new RuntimeException(
                            "Action không hợp lệ: " + request.getAction()
                                    + ". Chỉ chấp nhận HIDE | SHOW | DELETE");
                }
                success++;
            } catch (Exception e) {
                fail++;
                errors.add("reviewId=" + reviewId + ": " + e.getMessage());
                log.warn("[Admin] Bulk review action lỗi reviewId={}: {}", reviewId, e.getMessage());
            }
        }

        String message = String.format("Thành công %d / %d review.", success, request.getReviewIds().size());
        return new BulkReviewActionResponse(success, fail, errors, message);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminReviewResponse> getReviewsByProduct(
            Long productId, Integer rating, String statusStr, int page, int size) {

        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + productId);
        }

        AdminReviewFilterRequest filter = new AdminReviewFilterRequest();
        filter.setProductId(productId);
        filter.setRating(rating);
        filter.setStatus(statusStr != null ? statusStr : "all");
        filter.setPage(page);
        filter.setSize(size);
        return getReviews(filter);
    }

    private Review findReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy review id: " + reviewId));
    }

    private void updateProductRating(Product product) {
        Double avg = reviewRepository.avgRatingByProductId(product.getId());
        long cnt = reviewRepository.countByProductIdAndStatus(
                product.getId(), ReviewStatus.VISIBLE);
        product.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        product.setReviewCount((int) cnt);
        productRepository.save(product);
    }

    private ReviewStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.isBlank() || statusStr.equalsIgnoreCase("all")) {
            return null;
        }
        try {
            return ReviewStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Status không hợp lệ: " + statusStr);
        }
    }

    private Boolean parseType(String type, String targetType) {
        if (type == null || type.equalsIgnoreCase("all"))
            return null;
        if (type.equalsIgnoreCase(targetType))
            return true;
        return null;
    }

    private Pageable buildPageable(AdminReviewFilterRequest filter) {
        Sort sort = switch (filter.getSortBy() != null ? filter.getSortBy() : "newest") {
            case "oldest" -> Sort.by("createdAt").ascending();
            case "rating_asc" -> Sort.by("rating").ascending();
            case "rating_desc" -> Sort.by("rating").descending();
            default -> Sort.by("createdAt").descending();
        };
        int page = Math.max(filter.getPage(), 0);
        int size = (filter.getSize() > 0 && filter.getSize() <= 100) ? filter.getSize() : 20;
        return PageRequest.of(page, size, sort);
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
package com.example.backend.review.controller;

import com.example.backend.product.dto.PageResponse;
import com.example.backend.review.dto.ReviewRequest;
import com.example.backend.review.dto.ReviewResponse;
import com.example.backend.review.dto.ReviewSummaryResponse;
import com.example.backend.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    //PUBLIC: xem review

    @GetMapping
    public ResponseEntity<PageResponse<ReviewResponse>> getReviews(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                reviewService.getProductReviews(productId, rating, page, size));
    }


    @GetMapping("/summary")
    public ResponseEntity<ReviewSummaryResponse> getSummary(
            @PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewSummary(productId));
    }

    //USER: tạo review

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long productId,
            @RequestParam Long variantId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment,
            @RequestPart(required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ReviewRequest request = new ReviewRequest();
        request.setVariantId(variantId);
        request.setRating(rating);
        request.setComment(comment);

        ReviewResponse response = reviewService.createReview(
                userDetails.getUsername(), request, images);
        return ResponseEntity.status(201).body(response);
    }

    // USER: sửa review
    @PutMapping(value = "/{reviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comment,
            @RequestPart(required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ReviewRequest request = new ReviewRequest();
        request.setVariantId(null);
        request.setRating(rating);
        request.setComment(comment);

        return ResponseEntity.ok(
                reviewService.updateReview(userDetails.getUsername(), reviewId, request, images));
    }

    // USER: xóa 1 ảnh trong review


    @DeleteMapping("/{reviewId}/images/{imageId}")
    public ResponseEntity<Map<String, String>> deleteImage(
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        reviewService.deleteReviewImage(userDetails.getUsername(), reviewId, imageId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa ảnh thành công!"));
    }

    //USER: xóa review

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        reviewService.deleteReview(userDetails.getUsername(), reviewId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa review thành công!"));
    }
}
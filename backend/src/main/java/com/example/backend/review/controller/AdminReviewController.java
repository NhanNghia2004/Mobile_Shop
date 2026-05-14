package com.example.backend.review.controller;

import com.example.backend.product.dto.PageResponse;
import com.example.backend.review.dto.AdminReplyRequest;
import com.example.backend.review.dto.ReviewResponse;
import com.example.backend.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<PageResponse<ReviewResponse>> getAllReviews(
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                reviewService.getAllReviewsForAdmin(productId, page, size));
    }

    @PatchMapping("/{reviewId}/visibility")
    public ResponseEntity<ReviewResponse> toggleVisibility(
            @PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.toggleVisibility(reviewId));
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ReviewResponse> replyReview(
            @PathVariable Long reviewId,
            @RequestBody AdminReplyRequest request
    ) {
        return ResponseEntity.ok(reviewService.replyReview(reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long reviewId) {
        reviewService.adminDeleteReview(reviewId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa review thành công!"));
    }
}
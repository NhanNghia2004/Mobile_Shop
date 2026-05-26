package com.example.backend.admin.review.controller;

import com.example.backend.admin.review.dto.*;
import com.example.backend.admin.review.service.AdminReviewService;
import com.example.backend.product.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    // Thống kê tổng quan: tổng review, visible, hidden, có ảnh, có reply, chưa reply, phân bố sao

    @GetMapping("/stats")
    public ResponseEntity<AdminReviewStatsResponse> getStats() {
        return ResponseEntity.ok(adminReviewService.getStats());
    }
    // Danh sách review với filter + phân trang

    @GetMapping
    public ResponseEntity<PageResponse<AdminReviewResponse>> getReviews(
            @RequestParam(required = false)        String  keyword,
            @RequestParam(required = false)        Long    productId,
            @RequestParam(required = false)        Integer rating,
            @RequestParam(defaultValue = "all")    String  status,
            @RequestParam(defaultValue = "all")    String  type,
            @RequestParam(defaultValue = "newest") String  sortBy,
            @RequestParam(defaultValue = "0")      int     page,
            @RequestParam(defaultValue = "20")     int     size
    ) {
        AdminReviewFilterRequest filter = new AdminReviewFilterRequest();
        filter.setKeyword(keyword);
        filter.setProductId(productId);
        filter.setRating(rating);
        filter.setStatus(status);
        filter.setType(type);
        filter.setSortBy(sortBy);
        filter.setPage(page);
        filter.setSize(size);

        return ResponseEntity.ok(adminReviewService.getReviews(filter));
    }
    // Chi tiết 1 review

    @GetMapping("/{id}")
    public ResponseEntity<AdminReviewResponse> getReviewDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminReviewService.getReviewDetail(id));
    }
    // Tất cả review của 1 sản phẩm (kể cả HIDDEN)

    @GetMapping("/product/{productId}")
    public ResponseEntity<PageResponse<AdminReviewResponse>> getReviewsByProduct(
            @PathVariable Long productId,
            @RequestParam(required = false)     Integer rating,
            @RequestParam(defaultValue = "all") String  status,
            @RequestParam(defaultValue = "0")   int     page,
            @RequestParam(defaultValue = "20")  int     size
    ) {
        return ResponseEntity.ok(
                adminReviewService.getReviewsByProduct(productId, rating, status, page, size));
    }
    // Ẩn review

    @PatchMapping("/{id}/hide")
    public ResponseEntity<AdminReviewResponse> hideReview(@PathVariable Long id) {
        return ResponseEntity.ok(adminReviewService.hideReview(id));
    }
    // Hiện review

    @PatchMapping("/{id}/show")
    public ResponseEntity<AdminReviewResponse> showReview(@PathVariable Long id) {
        return ResponseEntity.ok(adminReviewService.showReview(id));
    }
    // Toggle hiện / ẩn

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<AdminReviewResponse> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(adminReviewService.toggleVisibility(id));
    }
    // Xóa vĩnh viễn review (kèm ảnh)

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable Long id) {
        adminReviewService.deleteReview(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa review thành công!"));
    }
    // Thêm reply mới

    @PostMapping("/{id}/reply")
    public ResponseEntity<AdminReviewResponse> replyReview(
            @PathVariable Long id,
            @RequestBody AdminReplyRequest request
    ) {
        return ResponseEntity.ok(adminReviewService.replyReview(id, request));
    }
    // Sửa reply đã có

    @PutMapping("/{id}/reply")
    public ResponseEntity<AdminReviewResponse> updateReply(
            @PathVariable Long id,
            @RequestBody AdminReplyRequest request
    ) {
        return ResponseEntity.ok(adminReviewService.updateReply(id, request));
    }
    // Xóa reply

    @DeleteMapping("/{id}/reply")
    public ResponseEntity<AdminReviewResponse> deleteReply(@PathVariable Long id) {
        return ResponseEntity.ok(adminReviewService.deleteReply(id));
    }
    // Thao tác hàng loạt


    @PostMapping("/bulk-action")
    public ResponseEntity<BulkReviewActionResponse> bulkAction(
            @RequestBody BulkReviewActionRequest request
    ) {
        return ResponseEntity.ok(adminReviewService.bulkAction(request));
    }
}
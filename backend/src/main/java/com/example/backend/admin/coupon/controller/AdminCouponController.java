package com.example.backend.admin.coupon.controller;

import com.example.backend.coupon.dto.CouponRequest;
import com.example.backend.coupon.dto.CouponResponse;
import com.example.backend.coupon.service.CouponService;
import com.example.backend.product.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCouponController {

    private final CouponService couponService;

    @GetMapping
    public ResponseEntity<PageResponse<CouponResponse>> filterCoupons(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(couponService.filterAdminCoupons(keyword, isActive, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(@RequestBody CouponRequest request) {
        return ResponseEntity.status(201).body(couponService.createCoupon(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(@PathVariable Long id, @RequestBody CouponRequest request) {
        return ResponseEntity.ok(couponService.updateCoupon(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<CouponResponse> toggleCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.toggleStatus(id));
    }
}

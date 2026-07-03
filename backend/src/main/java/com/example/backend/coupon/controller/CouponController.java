package com.example.backend.coupon.controller;

import com.example.backend.coupon.dto.CouponResponse;
import com.example.backend.coupon.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/validate")
    public ResponseEntity<CouponResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam Double total
    ) {
        return ResponseEntity.ok(couponService.validateCoupon(code, total));
    }
    @GetMapping("/active")
    public ResponseEntity<java.util.List<CouponResponse>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getActiveCoupons());
    }
}

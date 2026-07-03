package com.example.backend.coupon.dto;

import com.example.backend.coupon.entity.Coupon;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    private String code;
    private Coupon.DiscountType discountType;
    private Double discountValue;
    private Double minOrderValue;
    private Double maxDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Boolean isActive;
}

package com.example.backend.coupon.dto;

import com.example.backend.coupon.entity.Coupon;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CouponResponse {
    private Long id;
    private String code;
    private String discountType;
    private Double discountValue;
    private Double minOrderValue;
    private Double maxDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static CouponResponse from(Coupon coupon) {
        CouponResponse res = new CouponResponse();
        res.setId(coupon.getId());
        res.setCode(coupon.getCode());
        res.setDiscountType(coupon.getDiscountType().name());
        res.setDiscountValue(coupon.getDiscountValue());
        res.setMinOrderValue(coupon.getMinOrderValue());
        res.setMaxDiscountAmount(coupon.getMaxDiscountAmount());
        res.setStartDate(coupon.getStartDate());
        res.setEndDate(coupon.getEndDate());
        res.setUsageLimit(coupon.getUsageLimit());
        res.setUsedCount(coupon.getUsedCount());
        res.setIsActive(coupon.getIsActive());
        res.setCreatedAt(coupon.getCreatedAt());
        return res;
    }
}

package com.example.backend.coupon.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // PERCENT or FIXED

    @Column(nullable = false)
    private Double discountValue;

    @Column(nullable = false)
    private Double minOrderValue;

    private Double maxDiscountAmount;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Integer usageLimit;
    private Integer usedCount = 0;

    private Boolean isActive = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum DiscountType {
        PERCENT, FIXED
    }
}

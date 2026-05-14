package com.example.backend.product.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "product_variants")
@Data
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết về sản phẩm cha
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Dung lượng (GB)
    @Column(nullable = false)
    private Integer storage;

    // Tên màu:
    @Column(nullable = false)
    private String color;

    // Mã hex để hiển thị ô màu trên UI
    private String colorHex;

    // Giá riêng cho từng variant
    @Column(nullable = false)
    private Double price;

    // Giá khuyến mãi
    private Double discountPrice;

    // Tồn kho riêng cho từng variant
    @Column(nullable = false)
    private Integer stockQuantity = 0;

    // Ảnh riêng cho màu này
    private String imageUrl;

    // Trạng thái riêng:
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.ACTIVE;

    // Computed helpers

    @Transient
    public Double getDisplayPrice() {
        return discountPrice != null ? discountPrice : price;
    }

    @Transient
    public Integer getDiscountPercent() {
        if (discountPrice == null || price == null || price == 0) return 0;
        return (int) Math.round((1 - discountPrice / price) * 100);
    }
}
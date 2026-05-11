package com.example.backend.product.dto;

import lombok.Data;

@Data
public class VariantRequest {
    private Integer storage;       // GB: 128, 256, 512
    private String color;          // "Titan Đen"
    private String colorHex;       // "#1C1C1E"
    private Double price;
    private Double discountPrice;  // null = không giảm
    private Integer stockQuantity;
    private String imageUrl;       // ảnh riêng cho màu này (có thể null)
    private String status;
}
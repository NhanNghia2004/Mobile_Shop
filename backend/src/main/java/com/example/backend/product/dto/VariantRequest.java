package com.example.backend.product.dto;

import lombok.Data;

@Data
public class VariantRequest {
    private Integer storage;
    private String color;
    private String colorHex;
    private Double price;
    private Double discountPrice;
    private Integer stockQuantity;
    private String status;
}
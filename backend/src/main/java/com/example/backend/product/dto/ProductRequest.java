package com.example.backend.product.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private String brand;
    private String description;
    private String imageUrl;
    private String category;         // flagship | mid-range | budget | gaming
    private String os;               // Android | iOS
    private Integer ram;
    private Double screenSize;
    private Integer batteryCapacity;
    private String status;           // ACTIVE | INACTIVE

    // Mỗi combo (màu + dung lượng) là 1 variant với giá và tồn kho riêng
    private List<VariantRequest> variants;
}
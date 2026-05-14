package com.example.backend.product.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private String brand;
    private String description;
    private String imageUrl;
    private String category;
    private String os;               // Android | iOS
    private Integer ram;
    private Double screenSize;
    private Integer batteryCapacity;
    private String status;


    private List<VariantRequest> variants;
}
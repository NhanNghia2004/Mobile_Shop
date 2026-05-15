package com.example.backend.product.dto;

import lombok.Data;

@Data
public class ProductFilterRequest {

    private String keyword;
    private String brand;
    private String category;
    private String os;

    // Lọc theo displayPrice
    private Double minPrice;
    private Double maxPrice;

    private String sortBy;
    private int    page = 0;
    private int    size = 12;
}
package com.example.backend.product.dto;

import lombok.Data;

@Data
public class ProductFilterRequest {

    private String keyword;     // Tìm theo tên / brand
    private String brand;
    private String category;
    private String os;
    private Double minPrice;
    private Double maxPrice;
    private String sortBy;      // price_asc | price_desc | newest | bestseller | rating
    private int page = 0;
    private int size = 12;
}
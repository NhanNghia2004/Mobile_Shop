package com.example.backend.admin.product.dto;

import lombok.Data;

@Data
public class AdminProductFilterRequest {


    private String keyword;

    private String brand;

    private String category;

    private String os;

    private String status = "all";

    private String sortBy = "newest";

    private int page = 0;
    private int size = 20;
}
package com.example.backend.admin.inventory.dto;

import lombok.Data;

@Data
public class InventoryFilterRequest {

    private String keyword;


    private String category;

    private String brand;

    private String stockStatus = "all";

    private int lowStockThreshold = 5;

    private String sortBy = "stock_asc";

    private int page = 0;
    private int size = 20;
}
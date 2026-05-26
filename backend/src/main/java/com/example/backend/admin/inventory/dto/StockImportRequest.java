package com.example.backend.admin.inventory.dto;

import lombok.Data;

@Data
public class StockImportRequest {
    private Long    variantId;
    private Integer quantity;
    private String  note;
}
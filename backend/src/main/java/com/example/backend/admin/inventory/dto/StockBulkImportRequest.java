package com.example.backend.admin.inventory.dto;

import lombok.Data;

import java.util.List;

@Data
public class StockBulkImportRequest {
    private List<StockImportRequest> items;
    private String note;
}
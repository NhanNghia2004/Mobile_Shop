package com.example.backend.admin.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminProductStatsResponse {
    private long totalProducts;
    private long activeProducts;
    private long inactiveProducts;
    private long outOfStockProducts;
    private long totalVariants;
    private long totalSold;
}
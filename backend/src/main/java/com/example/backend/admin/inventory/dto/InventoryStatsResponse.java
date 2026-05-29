package com.example.backend.admin.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class InventoryStatsResponse {
    private long totalProducts;       // Tổng sản phẩm ACTIVE
    private long totalVariants;       // Tổng variant
    private long outOfStockProducts;  // Sản phẩm hết hàng hoàn toàn (tổng stock các variant = 0)
    private long lowStockProducts;    // Sản phẩm sắp hết (tổng stock <= ngưỡng)
    private long totalStockUnits;     // Tổng đơn vị tồn kho toàn hệ thống
}
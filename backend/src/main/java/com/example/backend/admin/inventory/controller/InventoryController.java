package com.example.backend.admin.inventory.controller;

import com.example.backend.admin.inventory.dto.*;
import com.example.backend.admin.inventory.service.InventoryService;
import com.example.backend.product.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // ── GET /api/admin/inventory/stats ──────────────────────────────────────
    // Thống kê tổng quan: tổng sản phẩm, variant, hết hàng, sắp hết, tổng đơn vị
    // Query param: threshold (default 5)

    @GetMapping("/stats")
    public ResponseEntity<InventoryStatsResponse> getStats(
            @RequestParam(defaultValue = "5") int threshold
    ) {
        return ResponseEntity.ok(inventoryService.getStats(threshold));
    }

    // ── GET /api/admin/inventory ─────────────────────────────────────────────
    // Danh sách tồn kho theo sản phẩm với filter + phân trang
    //
    // Query params:
    //   keyword     — tìm theo tên sản phẩm / brand
    //   brand       — lọc theo brand
    //   category    — SMARTPHONE | TABLET | LAPTOP | ...
    //   stockStatus — all (default) | out | low | available
    //   threshold   — ngưỡng sắp hết (default 5)
    //   sortBy      — stock_asc (default) | stock_desc | name_asc | name_desc | newest
    //   page, size

    @GetMapping
    public ResponseEntity<PageResponse<ProductStockResponse>> getInventory(
            @RequestParam(required = false)           String  keyword,
            @RequestParam(required = false)           String  brand,
            @RequestParam(required = false)           String  category,
            @RequestParam(defaultValue = "all")       String  stockStatus,
            @RequestParam(defaultValue = "5")         int     threshold,
            @RequestParam(defaultValue = "stock_asc") String  sortBy,
            @RequestParam(defaultValue = "0")         int     page,
            @RequestParam(defaultValue = "20")        int     size
    ) {
        InventoryFilterRequest filter = new InventoryFilterRequest();
        filter.setKeyword(keyword);
        filter.setBrand(brand);
        filter.setCategory(category);
        filter.setStockStatus(stockStatus);
        filter.setLowStockThreshold(threshold);
        filter.setSortBy(sortBy);
        filter.setPage(page);
        filter.setSize(size);

        return ResponseEntity.ok(inventoryService.getInventory(filter));
    }

    // ── GET /api/admin/inventory/low-stock ──────────────────────────────────
    // Danh sách sản phẩm hết / sắp hết hàng (cảnh báo nhanh)
    // Query param: threshold (default 5)

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductStockResponse>> getLowStock(
            @RequestParam(defaultValue = "5") int threshold
    ) {
        return ResponseEntity.ok(inventoryService.getLowStockProducts(threshold));
    }

    // ── GET /api/admin/inventory/products/{productId} ───────────────────────
    // Chi tiết tồn kho 1 sản phẩm (tất cả variant)

    @GetMapping("/products/{productId}")
    public ResponseEntity<ProductStockResponse> getProductStock(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "5") int threshold
    ) {
        return ResponseEntity.ok(inventoryService.getProductStock(productId, threshold));
    }

    // ── POST /api/admin/inventory/import ────────────────────────────────────
    // Nhập kho 1 variant
    // Body: { "variantId": 10, "quantity": 50, "note": "Nhập từ nhà cung cấp A" }

    @PostMapping("/import")
    public ResponseEntity<StockHistoryResponse> importStock(
            @RequestBody StockImportRequest request
    ) {
        return ResponseEntity.ok(inventoryService.importStock(request));
    }

    // ── POST /api/admin/inventory/import/bulk ───────────────────────────────
    // Nhập kho hàng loạt
    // Body: {
    //   "note": "Lô hàng tháng 6",
    //   "items": [
    //     { "variantId": 10, "quantity": 100 },
    //     { "variantId": 11, "quantity": 50, "note": "Ghi chú riêng" }
    //   ]
    // }

    @PostMapping("/import/bulk")
    public ResponseEntity<List<StockHistoryResponse>> bulkImportStock(
            @RequestBody StockBulkImportRequest request
    ) {
        return ResponseEntity.ok(inventoryService.bulkImportStock(request));
    }

    // ── PATCH /api/admin/inventory/variants/{variantId}/adjust ─────────────
    // Điều chỉnh tồn kho về con số cụ thể (kiểm kê thực tế)
    // Body: { "newQuantity": 35, "note": "Kiểm kê thực tế ngày 01/06" }

    @PatchMapping("/variants/{variantId}/adjust")
    public ResponseEntity<StockHistoryResponse> adjustStock(
            @PathVariable Long variantId,
            @RequestBody StockAdjustRequest request
    ) {
        return ResponseEntity.ok(inventoryService.adjustStock(variantId, request));
    }

    // ── GET /api/admin/inventory/history ────────────────────────────────────
    // Toàn bộ lịch sử thay đổi tồn kho
    // Query params:
    //   keyword    — tìm theo tên sản phẩm / brand
    //   changeType — IMPORT | ORDER_DEDUCT | ORDER_RESTORE | ADJUSTMENT | SYSTEM
    //   page, size

    @GetMapping("/history")
    public ResponseEntity<PageResponse<StockHistoryResponse>> getAllHistory(
            @RequestParam(required = false)    String keyword,
            @RequestParam(required = false)    String changeType,
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "20") int    size
    ) {
        return ResponseEntity.ok(
                inventoryService.getAllHistory(keyword, changeType, page, size));
    }

    // ── GET /api/admin/inventory/variants/{variantId}/history ───────────────
    // Lịch sử tồn kho theo variant

    @GetMapping("/variants/{variantId}/history")
    public ResponseEntity<PageResponse<StockHistoryResponse>> getVariantHistory(
            @PathVariable Long variantId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                inventoryService.getHistoryByVariant(variantId, page, size));
    }

    // ── GET /api/admin/inventory/products/{productId}/history ───────────────
    // Lịch sử tồn kho theo product (tất cả variant)

    @GetMapping("/products/{productId}/history")
    public ResponseEntity<PageResponse<StockHistoryResponse>> getProductHistory(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                inventoryService.getHistoryByProduct(productId, page, size));
    }
}
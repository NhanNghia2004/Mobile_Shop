package com.example.backend.product.controller;

import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.dto.ProductRequest;
import com.example.backend.product.dto.ProductResponse;
import com.example.backend.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API quản lý sản phẩm — chỉ ADMIN
 *
 * GET    /api/admin/products              → Xem tất cả sản phẩm
 * POST   /api/admin/products              → Tạo sản phẩm mới
 * PUT    /api/admin/products/{id}         → Cập nhật sản phẩm
 * DELETE /api/admin/products/{id}         → Ẩn sản phẩm (soft delete)
 * DELETE /api/admin/products/{id}/hard    → Xóa hẳn sản phẩm
 * PATCH  /api/admin/products/{id}/stock   → Cập nhật tồn kho
 */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    // ── Xem tất cả sản phẩm (kể cả INACTIVE) ─────────────────────────────
    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        return ResponseEntity.ok(productService.getAllProductsForAdmin(page, size, sortBy));
    }

    // ── Tạo sản phẩm mới ──────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(201).body(response);
    }

    // ── Cập nhật sản phẩm ─────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    // ── Ẩn sản phẩm (soft delete: chuyển sang INACTIVE) ──────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Sản phẩm đã được ẩn thành công!"));
    }

    // ── Xóa hẳn sản phẩm ─────────────────────────────────────────────────
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Map<String, String>> hardDeleteProduct(@PathVariable Long id) {
        productService.hardDeleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Sản phẩm đã bị xóa vĩnh viễn!"));
    }

    // ── Cập nhật tồn kho ──────────────────────────────────────────────────
    // PATCH /api/admin/products/5/stock   body: { "quantity": 50 }
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body
    ) {
        Integer quantity = body.get("quantity");
        if (quantity == null) {
            throw new RuntimeException("Thiếu trường 'quantity' trong request body!");
        }
        return ResponseEntity.ok(productService.updateStock(id, quantity));
    }
}
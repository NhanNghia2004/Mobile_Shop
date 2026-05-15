package com.example.backend.product.controller;

import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.dto.ProductRequest;
import com.example.backend.product.dto.ProductResponse;
import com.example.backend.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    // Xem tất cả sản phẩm
    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0")      int page,
            @RequestParam(defaultValue = "20")     int size,
            @RequestParam(defaultValue = "newest") String sortBy
    ) {
        return ResponseEntity.ok(productService.getAllProductsForAdmin(page, size, sortBy));
    }

    // Tạo sản phẩm mới
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@RequestBody ProductRequest request) {
        return ResponseEntity.status(201).body(productService.createProduct(request));
    }

    // Cập nhật sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    // Ẩn sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Sản phẩm đã được ẩn thành công!"));
    }

    // Xóa hẳn sản phẩm
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Map<String, String>> hardDeleteProduct(@PathVariable Long id) {
        productService.hardDeleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Sản phẩm đã bị xóa vĩnh viễn!"));
    }


    @PatchMapping("/{id}/stock")
    public ResponseEntity<Map<String, String>> updateStock(@PathVariable Long id) {
        return ResponseEntity.badRequest().body(Map.of(
                "message", "Tồn kho quản lý theo variant! " +
                        "Dùng: PATCH /api/admin/products/" + id + "/variants/{variantId}/stock"
        ));
    }
}
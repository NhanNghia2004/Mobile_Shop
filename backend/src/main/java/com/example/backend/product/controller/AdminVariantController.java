package com.example.backend.product.controller;

import com.example.backend.product.dto.VariantRequest;
import com.example.backend.product.dto.VariantResponse;
import com.example.backend.product.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/admin/products/{productId}/variants")
@RequiredArgsConstructor
public class AdminVariantController {

    private final ProductVariantService variantService;

    @GetMapping
    public ResponseEntity<List<VariantResponse>> getVariants(@PathVariable Long productId) {
        return ResponseEntity.ok(variantService.getVariants(productId));
    }

    @PostMapping
    public ResponseEntity<VariantResponse> addVariant(
            @PathVariable Long productId,
            @RequestBody VariantRequest request
    ) {
        return ResponseEntity.status(201).body(variantService.addVariant(productId, request));
    }

    @PutMapping("/{variantId}")
    public ResponseEntity<VariantResponse> updateVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @RequestBody VariantRequest request
    ) {
        return ResponseEntity.ok(variantService.updateVariant(productId, variantId, request));
    }

    @DeleteMapping("/{variantId}")
    public ResponseEntity<Map<String, String>> deleteVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId
    ) {
        variantService.deleteVariant(productId, variantId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa variant thành công!"));
    }


    @PatchMapping("/{variantId}/stock")
    public ResponseEntity<VariantResponse> updateStock(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @RequestBody Map<String, Integer> body
    ) {
        Integer quantity = body.get("quantity");
        if (quantity == null) throw new RuntimeException("Thiếu trường 'quantity'!");
        return ResponseEntity.ok(variantService.updateVariantStock(productId, variantId, quantity));
    }
}
package com.example.backend.admin.product.controller;

import com.example.backend.admin.product.dto.*;
import com.example.backend.admin.product.service.AdminProductService;
import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.dto.ProductRequest;
import com.example.backend.product.dto.VariantRequest;
import com.example.backend.product.dto.VariantResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    // Thống kê tổng quan: tổng SP, active, inactive, hết hàng, variants, doanh số

    @GetMapping("/stats")
    public ResponseEntity<AdminProductStatsResponse> getStats() {
        return ResponseEntity.ok(adminProductService.getStats());
    }
    // Danh sách sản phẩm với filter + phân trang

    @GetMapping
    public ResponseEntity<PageResponse<AdminProductResponse>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String os,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        AdminProductFilterRequest filter = new AdminProductFilterRequest();
        filter.setKeyword(keyword);
        filter.setBrand(brand);
        filter.setCategory(category);
        filter.setOs(os);
        filter.setStatus(status);
        filter.setSortBy(sortBy);
        filter.setPage(page);
        filter.setSize(size);

        return ResponseEntity.ok(adminProductService.getProducts(filter));
    }
    // Chi tiết sản phẩm (kể cả INACTIVE)

    @GetMapping("/{id}")
    public ResponseEntity<AdminProductResponse> getProductDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminProductService.getProductDetail(id));
    }
    // Tạo sản phẩm mới

    @PostMapping
    public ResponseEntity<AdminProductResponse> createProduct(
            @RequestBody ProductRequest request) {
        return ResponseEntity.status(201).body(adminProductService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(adminProductService.updateProduct(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AdminProductResponse> patchProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(adminProductService.updateProductBasicInfo(id, request));
    }
    // Kích hoạt lại sản phẩm (INACTIVE → ACTIVE)

    @PatchMapping("/{id}/activate")
    public ResponseEntity<AdminProductResponse> activateProduct(@PathVariable Long id) {
        return ResponseEntity.ok(adminProductService.activateProduct(id));
    }
    // Ẩn sản phẩm (ACTIVE → INACTIVE)

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Map<String, String>> deactivateProduct(@PathVariable Long id) {
        adminProductService.deactivateProduct(id);
        return ResponseEntity.ok(Map.of("message", "Đã ẩn sản phẩm thành công!"));
    }
    // Xóa mềm (= deactivate)

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> softDeleteProduct(@PathVariable Long id) {
        adminProductService.deactivateProduct(id);
        return ResponseEntity.ok(Map.of("message", "Đã ẩn sản phẩm thành công!"));
    }
    // Xóa vĩnh viễn

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Map<String, String>> hardDeleteProduct(@PathVariable Long id) {
        adminProductService.hardDeleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa vĩnh viễn sản phẩm!"));
    }

    @PostMapping("/bulk-action")
    public ResponseEntity<BulkActionResponse> bulkAction(
            @RequestBody BulkActionRequest request) {
        return ResponseEntity.ok(adminProductService.bulkAction(request));
    }
    // Danh sách variant của 1 sản phẩm

    @GetMapping("/{productId}/variants")
    public ResponseEntity<List<VariantResponse>> getVariants(@PathVariable Long productId) {
        return ResponseEntity.ok(adminProductService.getVariants(productId));
    }
    // Thêm variant mới

    @PostMapping("/{productId}/variants")
    public ResponseEntity<VariantResponse> addVariant(
            @PathVariable Long productId,
            @RequestBody VariantRequest request) {
        return ResponseEntity.status(201).body(adminProductService.addVariant(productId, request));
    }
    // Cập nhật variant

    @PutMapping("/{productId}/variants/{variantId}")
    public ResponseEntity<VariantResponse> updateVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @RequestBody VariantRequest request) {
        return ResponseEntity.ok(adminProductService.updateVariant(productId, variantId, request));
    }
    // Xóa variant

    @DeleteMapping("/{productId}/variants/{variantId}")
    public ResponseEntity<Map<String, String>> deleteVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId) {
        adminProductService.deleteVariant(productId, variantId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa variant thành công!"));
    }

    // Upload ảnh variant (multipart, tối đa 6 ảnh/variant)

    @PostMapping(value = "/{productId}/variants/{variantId}/images/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VariantResponse> uploadVariantImages(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @RequestPart("files") List<MultipartFile> files) {
        return ResponseEntity.ok(
                adminProductService.uploadVariantImages(productId, variantId, files));
    }

    // Thêm ảnh variant bằng URL

    @PostMapping("/{productId}/variants/{variantId}/images/url")
    public ResponseEntity<VariantResponse> addVariantImageByUrl(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @RequestBody VariantImageRequest request) {
        return ResponseEntity.ok(
                adminProductService.addVariantImageByUrl(productId, variantId, request));
    }
    // Xóa ảnh variant

    @DeleteMapping("/{productId}/variants/{variantId}/images/{imageId}")
    public ResponseEntity<VariantResponse> deleteVariantImage(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @PathVariable Long imageId) {
        return ResponseEntity.ok(
                adminProductService.deleteVariantImage(productId, variantId, imageId));
    }

    // Sắp xếp lại thứ tự ảnh

    @PutMapping("/{productId}/variants/{variantId}/images/reorder")
    public ResponseEntity<VariantResponse> reorderVariantImages(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @RequestBody List<Long> imageIdOrders) {
        return ResponseEntity.ok(
                adminProductService.reorderVariantImages(productId, variantId, imageIdOrders));
    }
}
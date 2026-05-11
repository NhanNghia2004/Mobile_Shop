package com.example.backend.product.service;

import com.example.backend.product.dto.VariantRequest;
import com.example.backend.product.dto.VariantResponse;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    // ── Lấy danh sách variants của 1 sản phẩm ────────────────────────────
    public List<VariantResponse> getVariants(Long productId) {
        return variantRepository.findByProductId(productId)
                .stream().map(VariantResponse::from).collect(Collectors.toList());
    }

    // ── Thêm variant mới vào sản phẩm ────────────────────────────────────
    @Transactional
    public VariantResponse addVariant(Long productId, VariantRequest request) {
        Product product = findProductOrThrow(productId);
        validateVariantRequest(request);

        // Kiểm tra trùng combo storage + color
        variantRepository.findByProductIdAndStorageAndColorIgnoreCase(
                productId, request.getStorage(), request.getColor()
        ).ifPresent(v -> {
            throw new RuntimeException(
                    "Variant '" + request.getStorage() + "GB - " + request.getColor() + "' đã tồn tại!");
        });

        ProductVariant variant = mapToEntity(new ProductVariant(), request);
        variant.setProduct(product);

        return VariantResponse.from(variantRepository.save(variant));
    }

    // ── Cập nhật variant ──────────────────────────────────────────────────
    @Transactional
    public VariantResponse updateVariant(Long productId, Long variantId, VariantRequest request) {
        ProductVariant variant = findVariantOrThrow(variantId, productId);
        validateVariantRequest(request);

        // Kiểm tra trùng nếu thay đổi storage hoặc color
        variantRepository.findByProductIdAndStorageAndColorIgnoreCase(
                productId, request.getStorage(), request.getColor()
        ).ifPresent(existing -> {
            if (!existing.getId().equals(variantId)) {
                throw new RuntimeException(
                        "Variant '" + request.getStorage() + "GB - " + request.getColor() + "' đã tồn tại!");
            }
        });

        mapToEntity(variant, request);
        return VariantResponse.from(variantRepository.save(variant));
    }

    // ── Xóa variant ───────────────────────────────────────────────────────
    @Transactional
    public void deleteVariant(Long productId, Long variantId) {
        ProductVariant variant = findVariantOrThrow(variantId, productId);

        // Không cho xóa nếu chỉ còn 1 variant
        long variantCount = variantRepository.findByProductId(productId).size();
        if (variantCount <= 1) {
            throw new RuntimeException(
                    "Sản phẩm phải có ít nhất 1 variant! Hãy thêm variant khác trước khi xóa.");
        }

        variantRepository.delete(variant);
    }

    // ── Cập nhật tồn kho cho 1 variant ───────────────────────────────────
    @Transactional
    public VariantResponse updateVariantStock(Long productId, Long variantId, int quantity) {
        if (quantity < 0) throw new RuntimeException("Tồn kho không được âm!");

        ProductVariant variant = findVariantOrThrow(variantId, productId);
        variant.setStockQuantity(quantity);

        // Tự động cập nhật status
        if (quantity == 0 && variant.getStatus() == ProductStatus.ACTIVE) {
            variant.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (quantity > 0 && variant.getStatus() == ProductStatus.OUT_OF_STOCK) {
            variant.setStatus(ProductStatus.ACTIVE);
        }

        return VariantResponse.from(variantRepository.save(variant));
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private void validateVariantRequest(VariantRequest request) {
        if (request.getStorage() == null || request.getStorage() <= 0)
            throw new RuntimeException("Dung lượng (storage) không hợp lệ!");
        if (request.getColor() == null || request.getColor().trim().isEmpty())
            throw new RuntimeException("Màu sắc không được để trống!");
        if (request.getPrice() == null || request.getPrice() <= 0)
            throw new RuntimeException("Giá variant phải lớn hơn 0!");
        if (request.getDiscountPrice() != null && request.getDiscountPrice() >= request.getPrice())
            throw new RuntimeException("Giá khuyến mãi phải nhỏ hơn giá gốc!");
        if (request.getStockQuantity() != null && request.getStockQuantity() < 0)
            throw new RuntimeException("Tồn kho không được âm!");
    }

    private ProductVariant mapToEntity(ProductVariant v, VariantRequest req) {
        v.setStorage(req.getStorage());
        v.setColor(req.getColor().trim());
        v.setColorHex(req.getColorHex());
        v.setPrice(req.getPrice());
        v.setDiscountPrice(req.getDiscountPrice());
        v.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0);
        v.setImageUrl(req.getImageUrl());

        if (req.getStatus() != null) {
            try {
                v.setStatus(ProductStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Status không hợp lệ: " + req.getStatus());
            }
        }
        return v;
    }

    private ProductVariant findVariantOrThrow(Long variantId, Long productId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy variant id: " + variantId));

        if (!variant.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Variant này không thuộc sản phẩm id: " + productId);
        }
        return variant;
    }

    private Product findProductOrThrow(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + productId));
    }
}
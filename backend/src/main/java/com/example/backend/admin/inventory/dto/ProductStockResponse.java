package com.example.backend.admin.inventory.dto;

import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class ProductStockResponse {

    private Long                      productId;
    private String                    productName;
    private String                    brand;
    private String                    imageUrl;
    private String                    category;
    private ProductStatus             status;
    private Integer                   totalStock;
    private boolean                   lowStock;
    private List<VariantStockResponse> variants;

    public static ProductStockResponse from(Product p, int lowStockThreshold) {
        ProductStockResponse dto = new ProductStockResponse();
        dto.setProductId(p.getId());
        dto.setProductName(p.getName());
        dto.setBrand(p.getBrand());
        dto.setImageUrl(p.getImageUrl());
        dto.setCategory(p.getCategory() != null ? p.getCategory().name() : null);
        dto.setStatus(p.getStatus());

        List<VariantStockResponse> variants = p.getVariants().stream()
                .map(VariantStockResponse::from)
                .collect(Collectors.toList());
        dto.setVariants(variants);

        int total = variants.stream().mapToInt(VariantStockResponse::getStockQuantity).sum();
        dto.setTotalStock(total);
        dto.setLowStock(total <= lowStockThreshold);

        return dto;
    }
}
package com.example.backend.product.dto;

import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.entity.ProductVariant;
import lombok.Data;

@Data
public class VariantResponse {
    private Long id;
    private Integer storage;
    private String color;
    private String colorHex;
    private Double price;
    private Double discountPrice;
    private Integer discountPercent;
    private Integer stockQuantity;
    private java.util.List<String> images;
    private ProductStatus status;

    public static VariantResponse from(ProductVariant v) {
        VariantResponse dto = new VariantResponse();
        dto.setId(v.getId());
        dto.setStorage(v.getStorage());
        dto.setColor(v.getColor());
        dto.setColorHex(v.getColorHex());
        dto.setPrice(v.getPrice());
        dto.setDiscountPrice(v.getDiscountPrice());
        dto.setDiscountPercent(v.getDiscountPercent());
        dto.setStockQuantity(v.getStockQuantity());
        if (v.getImages() != null) {
            dto.setImages(v.getImages().stream()
                .sorted(java.util.Comparator.comparingInt(com.example.backend.product.entity.ProductVariantImage::getDisplayOrder))
                .map(com.example.backend.product.entity.ProductVariantImage::getImageUrl)
                .collect(java.util.stream.Collectors.toList()));
        } else {
            dto.setImages(new java.util.ArrayList<>());
        }
        dto.setStatus(v.getStatus());
        return dto;
    }
}
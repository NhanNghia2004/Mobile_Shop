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
    private java.util.List<VariantImageDto> variantImages;
    private ProductStatus status;

    @Data
    public static class VariantImageDto {
        private Long id;
        private String imageUrl;
        private Integer displayOrder;
    }

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
            
            dto.setVariantImages(v.getImages().stream()
                .sorted(java.util.Comparator.comparingInt(com.example.backend.product.entity.ProductVariantImage::getDisplayOrder))
                .map(img -> {
                    VariantImageDto imgDto = new VariantImageDto();
                    imgDto.setId(img.getId());
                    imgDto.setImageUrl(img.getImageUrl());
                    imgDto.setDisplayOrder(img.getDisplayOrder());
                    return imgDto;
                })
                .collect(java.util.stream.Collectors.toList()));
        } else {
            dto.setImages(new java.util.ArrayList<>());
            dto.setVariantImages(new java.util.ArrayList<>());
        }
        dto.setStatus(v.getStatus());
        return dto;
    }
}
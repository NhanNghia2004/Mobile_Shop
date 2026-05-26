package com.example.backend.admin.inventory.dto;

import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.entity.ProductVariantImage;
import lombok.Data;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class VariantStockResponse {

    private Long         variantId;
    private String       color;
    private String       colorHex;
    private Integer      storage;
    private Integer      stockQuantity;
    private ProductStatus status;
    private Double       price;
    private Double       discountPrice;
    private List<String> images;

    public static VariantStockResponse from(ProductVariant v) {
        VariantStockResponse dto = new VariantStockResponse();
        dto.setVariantId(v.getId());
        dto.setColor(v.getColor());
        dto.setColorHex(v.getColorHex());
        dto.setStorage(v.getStorage());
        dto.setStockQuantity(v.getStockQuantity());
        dto.setStatus(v.getStatus());
        dto.setPrice(v.getPrice());
        dto.setDiscountPrice(v.getDiscountPrice());

        if (v.getImages() != null) {
            dto.setImages(v.getImages().stream()
                    .sorted(Comparator.comparingInt(ProductVariantImage::getDisplayOrder))
                    .map(ProductVariantImage::getImageUrl)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
}
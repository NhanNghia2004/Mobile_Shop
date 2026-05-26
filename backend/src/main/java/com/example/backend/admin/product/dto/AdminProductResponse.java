package com.example.backend.admin.product.dto;

import com.example.backend.product.dto.VariantResponse;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class AdminProductResponse {

    private Long          id;
    private String        name;
    private String        brand;
    private String        description;
    private String        imageUrl;
    private String        category;
    private String        os;
    private Integer       ram;
    private Double        screenSize;
    private Integer       batteryCapacity;
    private ProductStatus status;

    // Thống kê
    private Integer soldCount;
    private Double  rating;
    private Integer reviewCount;

    // Giá
    private Double  minPrice;
    private Double  maxPrice;

    // Tồn kho
    private Integer totalStock;
    private boolean inStock;
    private long    outOfStockVariants;  // số variant đang hết hàng

    // Màu + dung lượng
    private List<String>  availableColors;
    private List<Integer> availableStorages;

    // Variants đầy đủ
    private List<VariantResponse> variants;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminProductResponse from(Product p) {
        AdminProductResponse dto = new AdminProductResponse();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setBrand(p.getBrand());
        dto.setDescription(p.getDescription());
        dto.setImageUrl(p.getImageUrl());
        dto.setCategory(p.getCategory() != null ? p.getCategory().name() : null);
        dto.setOs(p.getOs() != null ? p.getOs().name() : null);
        dto.setRam(p.getRam());
        dto.setScreenSize(p.getScreenSize());
        dto.setBatteryCapacity(p.getBatteryCapacity());
        dto.setStatus(p.getStatus());
        dto.setSoldCount(p.getSoldCount());
        dto.setRating(p.getRating());
        dto.setReviewCount(p.getReviewCount());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());

        // Computed từ variants
        dto.setMinPrice(p.getMinPrice());
        dto.setMaxPrice(p.getMaxPrice());
        dto.setTotalStock(p.getTotalStock());
        dto.setInStock(p.isInStock());
        dto.setAvailableColors(p.getAvailableColors());
        dto.setAvailableStorages(p.getAvailableStorages());

        dto.setOutOfStockVariants(p.getVariants().stream()
                .filter(v -> v.getStockQuantity() == 0)
                .count());

        dto.setVariants(p.getVariants().stream()
                .map(VariantResponse::from)
                .collect(Collectors.toList()));

        return dto;
    }
}
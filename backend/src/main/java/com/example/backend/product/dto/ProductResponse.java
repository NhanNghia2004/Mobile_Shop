package com.example.backend.product.dto;

import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ProductResponse {

    private Long id;
    private String name;
    private String brand;
    private String description;
    private String imageUrl;
    private String category;
    private String os;
    private Integer ram;
    private Double screenSize;
    private Integer batteryCapacity;
    private ProductStatus status;

    // Thống kê
    private Integer soldCount;
    private Double rating;
    private Integer reviewCount;
    private LocalDateTime createdAt;

    // Giá hiển thị
    private Double minPrice;
    private Double maxPrice;

    // Tổng tồn kho
    private Integer totalStock;
    private boolean inStock;

    // Màu + dung lượng có sẵn
    private List<String> availableColors;
    private List<Integer> availableStorages;

    // Toàn bộ variants
    private List<VariantResponse> variants;

    public static ProductResponse from(Product p) {
        ProductResponse dto = new ProductResponse();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setBrand(p.getBrand());
        dto.setDescription(p.getDescription());
        dto.setImageUrl(p.getImageUrl());
        dto.setCategory(p.getCategory());
        dto.setOs(p.getOs());
        dto.setRam(p.getRam());
        dto.setScreenSize(p.getScreenSize());
        dto.setBatteryCapacity(p.getBatteryCapacity());
        dto.setStatus(p.getStatus());
        dto.setSoldCount(p.getSoldCount());
        dto.setRating(p.getRating());
        dto.setReviewCount(p.getReviewCount());
        dto.setCreatedAt(p.getCreatedAt());

        // Computed từ variants
        dto.setMinPrice(p.getMinPrice());
        dto.setMaxPrice(p.getMaxPrice());
        dto.setTotalStock(p.getTotalStock());
        dto.setInStock(p.isInStock());
        dto.setAvailableColors(p.getAvailableColors());
        dto.setAvailableStorages(p.getAvailableStorages());

        dto.setVariants(
                p.getVariants().stream()
                        .map(VariantResponse::from)
                        .collect(Collectors.toList())
        );
        return dto;
    }
}
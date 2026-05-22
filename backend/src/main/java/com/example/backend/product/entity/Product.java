package com.example.backend.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String brand;

    @Column(length = 2000)
    private String description;

    private String imageUrl;
    @Enumerated(EnumType.STRING)
    private ProductCategory category;
    
    @Enumerated(EnumType.STRING)
    private OperatingSystem os;
    private Double screenSize;
    private Integer batteryCapacity;
    private Integer ram;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.ACTIVE;

    private Integer soldCount = 0;
    private Double rating = 0.0;
    private Integer reviewCount = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    private List<com.example.backend.review.entity.Review> reviews = new ArrayList<>();

    @org.hibernate.annotations.Formula("(SELECT MIN(COALESCE(v.discount_price, v.price)) FROM product_variants v WHERE v.product_id = id AND v.status = 'ACTIVE')")
    private Double minPriceDb;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Computed từ variants
    @Transient
    public Double getMinPrice() {
        if (minPriceDb != null) return minPriceDb;
        return variants != null ? variants.stream()
                .filter(v -> v.getStatus() == ProductStatus.ACTIVE)
                .mapToDouble(ProductVariant::getDisplayPrice)
                .min().orElse(0.0) : 0.0;
    }

    @Transient
    public Double getMaxPrice() {
        return variants.stream()
                .filter(v -> v.getStatus() == ProductStatus.ACTIVE)
                .mapToDouble(ProductVariant::getDisplayPrice)
                .max().orElse(0.0);
    }

    @Transient
    public Integer getTotalStock() {
        return variants.stream()
                .mapToInt(ProductVariant::getStockQuantity).sum();
    }

    @Transient
    public boolean isInStock() {
        return getTotalStock() > 0;
    }

    @Transient
    public List<String> getAvailableColors() {
        return variants.stream()
                .filter(v -> v.getStatus() == ProductStatus.ACTIVE
                        && v.getStockQuantity() > 0)
                .map(ProductVariant::getColor)
                .distinct().toList();
    }

    @Transient
    public List<Integer> getAvailableStorages() {
        return variants.stream()
                .filter(v -> v.getStatus() == ProductStatus.ACTIVE
                        && v.getStockQuantity() > 0)
                .map(ProductVariant::getStorage)
                .distinct().sorted().toList();
    }
}
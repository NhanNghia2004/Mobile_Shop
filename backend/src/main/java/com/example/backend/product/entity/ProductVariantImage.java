package com.example.backend.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_variant_images")
@Data
@NoArgsConstructor
public class ProductVariantImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private String imageUrl;

    private Integer displayOrder = 0;

    public ProductVariantImage(ProductVariant variant, String imageUrl, Integer displayOrder) {
        this.variant = variant;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
    }
}

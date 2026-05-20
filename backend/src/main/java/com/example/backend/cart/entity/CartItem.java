package com.example.backend.cart.entity;

import com.example.backend.product.entity.ProductVariant;
import com.example.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
        name = "cart_items",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_cart_user_variant",
                columnNames = {"user_id", "variant_id"}
        )
)
@Data
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false)
    private Integer quantity = 1;
}

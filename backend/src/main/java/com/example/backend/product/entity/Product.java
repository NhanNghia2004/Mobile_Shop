package com.example.backend.product.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data // Tự tạo getter, setter nhờ Lombok
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String brand;
    private Double price;
    private String description;
    private String imageUrl;
    private Integer stockQuantity;
}
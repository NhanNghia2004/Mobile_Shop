package com.example.backend.cart.dto;

import lombok.Data;

@Data
public class CartItemRequest {
    private Long variantId;
    private Integer quantity;
}

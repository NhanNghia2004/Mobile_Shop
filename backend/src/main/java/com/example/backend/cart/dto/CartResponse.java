package com.example.backend.cart.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartResponse {
    private List<CartItemResponse> items;
    private Double totalAmount;
    private Integer totalQuantity;
}

package com.example.backend.cart.dto;

import com.example.backend.cart.entity.CartItem;
import lombok.Data;

@Data
public class CartItemResponse {
    private Long id;
    private Long variantId;
    private Long productId;
    private String productName;
    private String color;
    private Integer storage;
    private String imageUrl;
    private Double price;
    private Double originalPrice;
    private Integer quantity;
    private Integer stockQuantity;
    private Double subTotal;

    public static CartItemResponse from(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.setId(item.getId());
        response.setVariantId(item.getVariant().getId());
        response.setProductId(item.getVariant().getProduct().getId());
        response.setProductName(item.getVariant().getProduct().getName());
        response.setColor(item.getVariant().getColor());
        response.setStorage(item.getVariant().getStorage());
        response.setImageUrl(item.getVariant().getImageUrl());
        response.setPrice(item.getVariant().getDisplayPrice());
        response.setOriginalPrice(item.getVariant().getPrice());
        response.setQuantity(item.getQuantity());
        response.setStockQuantity(item.getVariant().getStockQuantity());
        response.setSubTotal(response.getPrice() * item.getQuantity());
        return response;
    }
}

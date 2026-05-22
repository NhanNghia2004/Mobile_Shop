package com.example.backend.order.dto;

import com.example.backend.order.entity.OrderItem;
import lombok.Data;

@Data
public class OrderItemResponse {
    private Long id;
    private Long variantId;
    private Long productId;
    private String productName;
    private String color;
    private Integer storage;
    private String imageUrl;
    private Integer quantity;
    private Double price;

    public static OrderItemResponse from(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setVariantId(item.getVariant().getId());
        response.setProductId(item.getVariant().getProduct().getId());
        response.setProductName(item.getVariant().getProduct().getName());
        response.setColor(item.getVariant().getColor());
        response.setStorage(item.getVariant().getStorage());
        response.setImageUrl(item.getVariant().getPrimaryImageUrl());
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        return response;
    }
}

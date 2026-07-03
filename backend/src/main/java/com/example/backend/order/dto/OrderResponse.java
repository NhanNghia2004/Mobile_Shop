package com.example.backend.order.dto;

import com.example.backend.order.entity.Order;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class OrderResponse {
    private Long id;
    private String recipientName;
    private String phone;
    private String shippingAddress;
    private Double totalAmount;
    private Double discountAmount;
    private String couponCode;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    public static OrderResponse from(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setRecipientName(order.getRecipientName());
        response.setPhone(order.getPhone());
        response.setShippingAddress(order.getShippingAddress());
        response.setTotalAmount(order.getTotalAmount());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setCouponCode(order.getCouponCode());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setStatus(order.getStatus().name());
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(order.getOrderItems().stream()
                .map(OrderItemResponse::from)
                .collect(Collectors.toList()));
        return response;
    }
}

package com.example.backend.order.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private String recipientName;
    private String phone;
    private String shippingAddress;
    private String paymentMethod;
}

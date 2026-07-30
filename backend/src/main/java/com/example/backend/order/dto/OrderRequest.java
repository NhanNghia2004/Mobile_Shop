package com.example.backend.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String recipientName;
    private String phone;
    private String shippingAddress;
    private String paymentMethod;
    private List<Long> variantIds;
    private String couponCode;
    private Double shippingFee;
}

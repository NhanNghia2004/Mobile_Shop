package com.example.backend.payment.dto;

import lombok.Data;

@Data
public class VNPayCreateRequest {
    private Long orderId;           // ID đơn hàng đã tạo (từ checkout)
    private String orderInfo;       // Mô tả đơn hàng (tuỳ chọn, tối đa 255 ký tự)
    private String clientIp;        // IP của client (lấy từ request nếu null)
}
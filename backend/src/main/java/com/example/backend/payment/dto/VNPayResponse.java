package com.example.backend.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VNPayResponse {
    private String code;        // "00" = thành công, khác = lỗi
    private String message;
    private String paymentUrl;  // URL redirect đến cổng VNPay
}
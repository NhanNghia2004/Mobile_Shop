package com.example.backend.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VNPayIpnResponse {
    private String RspCode;   // VNPay yêu cầu đúng tên field này
    private String Message;
}
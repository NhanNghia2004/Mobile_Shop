package com.example.backend.payment.entity;

public enum PaymentStatus {
    PENDING,    // Chờ thanh toán
    SUCCESS,    // Thanh toán thành công
    FAILED,     // Thanh toán thất bại
    REFUNDED    // Đã hoàn tiền
}
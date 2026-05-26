package com.example.backend.admin.inventory.entity;

public enum StockChangeType {
    IMPORT,          // Nhập kho thủ công bởi admin
    ORDER_DEDUCT,    // Trừ kho khi đặt hàng
    ORDER_RESTORE,   // Hoàn kho khi hủy đơn
    ADJUSTMENT,      // Điều chỉnh tồn kho (set về con số cụ thể)
    SYSTEM           // Hệ thống tự cập nhật
}
package com.example.backend.admin.user.dto;

import lombok.Data;

@Data
public class LockUserRequest {
    /** Lý do khóa tài khoản (bắt buộc khi khóa, không cần khi mở) */
    private String reason;
}
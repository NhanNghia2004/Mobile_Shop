package com.example.backend.admin.user.dto;

import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminUserResponse {

    private Long   id;
    private String username;
    private String email;
    private Role   role;
    private String phone;
    private String address;
    private String avatarUrl;

    // Trạng thái tài khoản
    private boolean locked;
    private LocalDateTime lockedAt;
    private String  lockReason;

    private LocalDateTime createdAt;

    public static AdminUserResponse from(User user) {
        AdminUserResponse dto = new AdminUserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setLocked(user.isLocked());
        dto.setLockedAt(user.getLockedAt());
        dto.setLockReason(user.getLockReason());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
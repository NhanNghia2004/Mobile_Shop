package com.example.backend.user.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
}
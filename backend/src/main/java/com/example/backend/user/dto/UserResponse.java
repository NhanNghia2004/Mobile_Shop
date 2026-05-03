package com.example.backend.user.dto;

import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private String phone;
    private String address;
    private String avatarUrl;


    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatarUrl()
        );
    }
}
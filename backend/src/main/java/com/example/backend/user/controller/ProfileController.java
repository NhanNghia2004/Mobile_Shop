package com.example.backend.user.controller;

import com.example.backend.user.dto.ChangePasswordRequest;
import com.example.backend.user.dto.UpdateProfileRequest;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    //  XEM PROFILE

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        UserResponse response = profileService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    //  CẬP NHẬT PROFILE

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {

        UserResponse response = profileService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    //  ĐỔI MẬT KHẨU

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest request) {

        profileService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of(
                "message", "Đổi mật khẩu thành công! Vui lòng đăng nhập lại."
        ));
    }
}
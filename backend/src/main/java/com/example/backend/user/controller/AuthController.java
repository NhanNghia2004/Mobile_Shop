package com.example.backend.user.controller;

import com.example.backend.user.dto.*;
import com.example.backend.user.service.GoogleAuthService;
import com.example.backend.user.service.PasswordResetService;
import com.example.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;
    private final GoogleAuthService googleAuthService;

    //  ĐĂNG KÝ
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.status(201).body(response);
    }

    //  ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.authenticate(loginRequest);
        return ResponseEntity.ok(new AuthResponse(token));
    }
    //  ĐĂNG NHẬP BẰNG GOOGLE

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        String token = googleAuthService.loginWithGoogle(request.getIdToken());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse response = userService.getMe(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        try {
            passwordResetService.requestPasswordReset(request.getEmail());
        } catch (Exception ignored) {

        }

        return ResponseEntity.ok(Map.of(
                "message", "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu!"
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());

        return ResponseEntity.ok(Map.of(
                "message", "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại."
        ));
    }
}
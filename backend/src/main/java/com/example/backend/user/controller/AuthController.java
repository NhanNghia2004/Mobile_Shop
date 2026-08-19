package com.example.backend.user.controller;

import com.example.backend.config.JwtTokenProvider;
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
    private final JwtTokenProvider jwtTokenProvider;

    //  ĐĂNG KÝ - Bước 1: Validate + Gửi OTP
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        Map<String, String> response = userService.register(request);
        return ResponseEntity.ok(response);
    }

    //  ĐĂNG KÝ - Bước 2: Xác thực OTP -> Lưu DB
    @PostMapping("/verify-otp")
    public ResponseEntity<UserResponse> verifyOtp(@RequestBody VerifyOtpRequest request) {
        UserResponse response = userService.verifyOtpAndRegister(request.getEmail(), request.getOtpCode());
        return ResponseEntity.status(201).body(response);
    }

    //  GỬI LẠI OTP
    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@RequestBody ResendOtpRequest request) {
        Map<String, String> response = userService.resendOtp(request.getEmail());
        return ResponseEntity.ok(response);
    }

    //  ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {

        AuthResponse response = userService.authenticate(loginRequest);
        return ResponseEntity.ok(response);
    }
    //  ĐĂNG NHẬP BẰNG GOOGLE

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        String token = googleAuthService.loginWithGoogle(request.getIdToken());
        String username = jwtTokenProvider.getUsernameFromJWT(token);
        UserResponse user = userService.getMe(username);
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse response = userService.getMe(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestPasswordReset(request.getEmail());

        return ResponseEntity.ok(Map.of(
                "message", "Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn!"
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
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {

        return ResponseEntity.ok("Đăng xuất thành công");
    }
}
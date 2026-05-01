package com.example.backend.user.controller;

import com.example.backend.user.dto.AuthResponse;
import com.example.backend.user.dto.LoginRequest;
import com.example.backend.user.entity.User;
import com.example.backend.user.entity.Role;
import com.example.backend.user.repository.UserRepository;
import com.example.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 1. API ĐĂNG KÝ (Dùng để tạo User test)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Mã hóa mật khẩu trước khi lưu
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Gán quyền mặc định nếu request không gửi role
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        userRepository.save(user);
        return ResponseEntity.ok("Đăng ký thành công!");
    }

    // 2. API ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.authenticate(loginRequest);
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
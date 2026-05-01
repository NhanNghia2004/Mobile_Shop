package com.example.backend.user.service;

import com.example.backend.config.JwtTokenProvider;
import com.example.backend.user.dto.LoginRequest;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public String authenticate(LoginRequest loginRequest) {
        // 1. Tìm user trong DB
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User không tồn tại!"));

        // 2. Kiểm tra mật khẩu (so khớp mật khẩu đã mã hóa)
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        // 3. Nếu đúng, tạo JWT và trả về
        return tokenProvider.generateToken(user.getUsername(), user.getRole().name());
    }
}
package com.example.backend.user.service;

import com.example.backend.config.JwtTokenProvider;
import com.example.backend.user.dto.LoginRequest;
import com.example.backend.user.dto.RegisterRequest;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.entity.Role;
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

    //  ĐĂNG KÝ
    public UserResponse register(RegisterRequest request) {

        if (request.getUsername() == null || request.getUsername().trim().length() < 3) {
            throw new RuntimeException("Username phải có ít nhất 3 ký tự!");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new RuntimeException("Password phải có ít nhất 6 ký tự!");
        }
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new RuntimeException("Email không hợp lệ!");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại!");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // Mặc định là USER

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    // ĐĂNG NHẬP bằng Email
    public String authenticate(LoginRequest loginRequest) {
        // 1. Kiểm tra đầu vào (Dùng getEmail() thay vì getUsername())
        if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
            throw new RuntimeException("Email và password không được để trống!");
        }

        // 2. Tìm User bằng Email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        // 3. Kiểm tra mật khẩu
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        // 4. Trả về token (thường dùng email hoặc username làm subject đều được)
        return tokenProvider.generateToken(user.getEmail(), user.getRole().name());
    }

    public UserResponse getMe(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại!"));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.from(user);
    }
}
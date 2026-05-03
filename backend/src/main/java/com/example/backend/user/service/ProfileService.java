package com.example.backend.user.service;

import com.example.backend.user.dto.ChangePasswordRequest;
import com.example.backend.user.dto.UpdateProfileRequest;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // LẤY THÔNG TIN PROFILE
    public UserResponse getProfile(String username) {
        User user = findUser(username);
        return UserResponse.from(user);
    }

    // CẬP NHẬT PROFILE
    @Transactional
    public UserResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = findUser(username);

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().contains("@")) {
                throw new RuntimeException("Email không hợp lệ!");
            }

            if (!request.getEmail().equalsIgnoreCase(user.getEmail())) {
                userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
                    throw new RuntimeException("Email này đã được sử dụng bởi tài khoản khác!");
                });
            }
            user.setEmail(request.getEmail().trim());
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()) {

            String phone = request.getPhone().trim().replaceAll("\\s+", "");
            if (!phone.matches("^[+]?[0-9]{9,15}$")) {
                throw new RuntimeException("Số điện thoại không hợp lệ!");
            }
            user.setPhone(request.getPhone().trim());
        }

        // Cập nhật địa chỉ
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        // Cập nhật avatar URL
        if (request.getAvatarUrl() != null) {

            String url = request.getAvatarUrl().trim();
            if (!url.isEmpty() && !url.startsWith("http://") && !url.startsWith("https://")) {
                throw new RuntimeException("URL ảnh đại diện không hợp lệ! Phải bắt đầu bằng http:// hoặc https://");
            }
            user.setAvatarUrl(url.isEmpty() ? null : url);
        }

        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }

    // ĐỔI MẬT KHẨU
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = findUser(username);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác!");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Xác nhận mật khẩu không khớp!");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Helper
    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
    }
}
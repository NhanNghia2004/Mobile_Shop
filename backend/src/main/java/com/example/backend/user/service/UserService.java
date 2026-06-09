package com.example.backend.user.service;

import com.example.backend.config.JwtTokenProvider;
import com.example.backend.user.dto.AuthResponse;
import com.example.backend.user.dto.LoginRequest;
import com.example.backend.user.dto.RegisterRequest;
import com.example.backend.user.dto.UserResponse;
import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final OtpService otpService;
    private final EmailService emailService;

    // ĐĂNG KÝ - Bước 1: Validate + Gửi OTP (KHÔNG lưu DB)
    public Map<String, String> register(RegisterRequest request) {

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

        // Tạo OTP và lưu tạm (KHÔNG lưu user vào DB)
        String otpCode = otpService.createOtp(request);

        // Gửi email OTP
        emailService.sendOtpEmail(request.getEmail(), otpCode);

        return Map.of("message", "Mã OTP đã được gửi đến email " + request.getEmail());
    }

    // ĐĂNG KÝ - Bước 2: Xác thực OTP -> Lưu user vào DB
    public UserResponse verifyOtpAndRegister(String email, String otpCode) {
        OtpService.PendingRegistration pending = otpService.verifyOtp(email, otpCode);

        // Kiểm tra lại lần cuối trước khi lưu
        if (userRepository.findByUsername(pending.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại!");
        }
        if (userRepository.findByEmail(pending.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User user = new User();
        user.setUsername(pending.getUsername().trim());
        user.setEmail(pending.getEmail().trim());
        user.setPassword(passwordEncoder.encode(pending.getPassword()));
        user.setRole(Role.USER);

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    // GỬI LẠI OTP
    public Map<String, String> resendOtp(String email) {
        String newOtp = otpService.resendOtp(email);
        emailService.sendOtpEmail(email, newOtp);
        return Map.of("message", "Mã OTP mới đã được gửi đến email " + email);
    }

    // ĐĂNG NHẬP bằng Email
    public AuthResponse authenticate(LoginRequest loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getPassword() == null) {
            throw new RuntimeException("Email và password không được để trống!");
        }

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu không chính xác!");
        }

        if (user.isLocked()) {
            String reason = user.getLockReason() != null
                    ? user.getLockReason()
                    : "Tài khoản của bạn đã bị khóa!";
            throw new LockedException("Tài khoản bị khóa: " + reason);
        }

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, UserResponse.from(user));
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
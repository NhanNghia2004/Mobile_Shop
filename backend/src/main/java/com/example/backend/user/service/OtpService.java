package com.example.backend.user.service;

import com.example.backend.user.dto.RegisterRequest;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service quản lý OTP trong bộ nhớ tạm (in-memory).
 * Thông tin đăng ký KHÔNG lưu vào DB cho tới khi xác thực OTP thành công.
 */
@Service
public class OtpService {

    // Lưu trữ tạm thông tin đăng ký + OTP theo email
    private final Map<String, PendingRegistration> pendingRegistrations = new ConcurrentHashMap<>();

    private static final int OTP_EXPIRATION_MINUTES = 3;

    /**
     * Tạo mã OTP 6 số và lưu tạm thông tin đăng ký.
     */
    public String createOtp(RegisterRequest request) {
        String otpCode = generateOtp();
        PendingRegistration pending = new PendingRegistration();
        pending.setUsername(request.getUsername());
        pending.setEmail(request.getEmail());
        pending.setPassword(request.getPassword());
        pending.setOtpCode(otpCode);
        pending.setExpiration(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));

        // Ghi đè nếu email đã có OTP cũ chưa xác thực
        pendingRegistrations.put(request.getEmail(), pending);
        return otpCode;
    }

    /**
     * Xác thực mã OTP. Trả về PendingRegistration nếu hợp lệ, ném exception nếu không.
     */
    public PendingRegistration verifyOtp(String email, String otpCode) {
        PendingRegistration pending = pendingRegistrations.get(email);

        if (pending == null) {
            throw new RuntimeException("Không tìm thấy yêu cầu đăng ký cho email này. Vui lòng đăng ký lại!");
        }

        if (LocalDateTime.now().isAfter(pending.getExpiration())) {
            pendingRegistrations.remove(email);
            throw new RuntimeException("Mã OTP đã hết hạn (3 phút). Vui lòng đăng ký lại!");
        }

        if (!pending.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Mã OTP không chính xác!");
        }

        // OTP hợp lệ -> xóa khỏi bộ nhớ tạm
        pendingRegistrations.remove(email);
        return pending;
    }

    /**
     * Tạo lại OTP mới cho email đã đăng ký trước đó.
     */
    public String resendOtp(String email) {
        PendingRegistration pending = pendingRegistrations.get(email);

        if (pending == null) {
            throw new RuntimeException("Không tìm thấy yêu cầu đăng ký cho email này. Vui lòng đăng ký lại!");
        }

        String newOtp = generateOtp();
        pending.setOtpCode(newOtp);
        pending.setExpiration(LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        return newOtp;
    }

    private String generateOtp() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6 chữ số
        return String.valueOf(code);
    }

    @Data
    public static class PendingRegistration {
        private String username;
        private String email;
        private String password;
        private String otpCode;
        private LocalDateTime expiration;
    }
}

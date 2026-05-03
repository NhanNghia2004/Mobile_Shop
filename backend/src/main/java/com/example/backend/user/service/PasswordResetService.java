package com.example.backend.user.service;

import com.example.backend.user.entity.PasswordResetToken;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.PasswordResetTokenRepository;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void requestPasswordReset(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong hệ thống!"));

        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // Validate password mới
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Link đặt lại mật khẩu không hợp lệ!"));


        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken); // Dọn dẹp token hết hạn
            throw new RuntimeException("Link đặt lại mật khẩu đã hết hạn! Vui lòng yêu cầu lại.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }
}
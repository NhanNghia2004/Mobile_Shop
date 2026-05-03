package com.example.backend.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String token) {

        String resetLink = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Yêu cầu đặt lại mật khẩu");
        message.setText(
                "Xin chào,\n\n" +
                        "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n" +
                        "Nhấn vào link bên dưới để đặt lại mật khẩu (hết hạn sau 15 phút):\n\n" +
                        resetLink + "\n\n" +
                        "Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.\n\n" +
                        "Trân trọng."
        );

        mailSender.send(message);
    }
}
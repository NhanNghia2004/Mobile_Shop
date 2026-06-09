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

    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Mã xác thực đăng ký tài khoản - Mobile Shop");
        message.setText(
                "Xin chào,\n\n" +
                        "Mã OTP xác thực tài khoản của bạn là:\n\n" +
                        "    " + otpCode + "\n\n" +
                        "Mã này có hiệu lực trong 3 phút.\n" +
                        "Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.\n\n" +
                        "Trân trọng,\nMobile Shop"
        );

        mailSender.send(message);
    }
}
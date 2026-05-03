package com.example.backend.user.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Data
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Token ngẫu nhiên sẽ gửi trong link email
    @Column(nullable = false, unique = true)
    private String token;

    // Liên kết với User nào
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Token hết hạn sau 15 phút
    @Column(nullable = false)
    private LocalDateTime expiryDate;

    public PasswordResetToken(String token, User user) {
        this.token = token;
        this.user = user;
        this.expiryDate = LocalDateTime.now().plusMinutes(15);
    }

    // Kiểm tra token còn hạn không
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}
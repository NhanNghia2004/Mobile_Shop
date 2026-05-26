package com.example.backend.user.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String phone;
    private String address;
    private String avatarUrl;

    // ── Khóa tài khoản ──────────────────────────────────────────────────────
    @Column(nullable = false)
    private boolean locked = false;

    private LocalDateTime lockedAt;

    @Column(length = 500)
    private String lockReason;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
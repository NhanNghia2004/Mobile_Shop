package com.example.backend.user.repository;

import com.example.backend.user.entity.PasswordResetToken;
import com.example.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    // Tìm token theo chuỗi token (từ link email)
    Optional<PasswordResetToken> findByToken(String token);

    // Xóa token cũ của user trước khi tạo token mới
    void deleteByUser(User user);
}
package com.example.backend.admin.user.service;

import com.example.backend.admin.user.dto.*;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.product.dto.PageResponse;
import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    // ── Danh sách + tìm kiếm + phân trang ──────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getUsers(AdminUserFilterRequest filter) {
        Role    role    = parseRole(filter.getRole());
        Pageable pageable = buildPageable(filter);

        Page<User> page = userRepository.searchUsers(
                nullIfBlank(filter.getKeyword()),
                role,
                filter.getLocked(),
                pageable
        );

        return PageResponse.from(page, AdminUserResponse::from);
    }

    // ── Xem chi tiết 1 user ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminUserResponse getUserDetail(Long userId) {
        User user = findUser(userId);
        return AdminUserResponse.from(user);
    }

    // ── Khóa tài khoản ──────────────────────────────────────────────────────

    @Transactional
    public AdminUserResponse lockUser(Long userId, LockUserRequest request) {
        User user = findUser(userId);

        // Không cho khóa chính mình
        String currentUsername = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        if (user.getUsername().equals(currentUsername)) {
            throw new RuntimeException("Bạn không thể tự khóa tài khoản của chính mình!");
        }

        // Không cho khóa admin khác
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Không thể khóa tài khoản Admin!");
        }

        if (user.isLocked()) {
            throw new RuntimeException("Tài khoản này đã bị khóa trước đó!");
        }

        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new RuntimeException("Vui lòng nhập lý do khóa tài khoản!");
        }

        user.setLocked(true);
        user.setLockedAt(LocalDateTime.now());
        user.setLockReason(request.getReason().trim());

        log.info("[Admin] Khóa tài khoản userId={} bởi admin={}",
                userId, currentUsername);

        return AdminUserResponse.from(userRepository.save(user));
    }

    // ── Mở khóa tài khoản ───────────────────────────────────────────────────

    @Transactional
    public AdminUserResponse unlockUser(Long userId) {
        User user = findUser(userId);

        if (!user.isLocked()) {
            throw new RuntimeException("Tài khoản này chưa bị khóa!");
        }

        user.setLocked(false);
        user.setLockedAt(null);
        user.setLockReason(null);

        String currentUsername = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        log.info("[Admin] Mở khóa tài khoản userId={} bởi admin={}",
                userId, currentUsername);

        return AdminUserResponse.from(userRepository.save(user));
    }

    // ── Đổi role ────────────────────────────────────────────────────────────

    @Transactional
    public AdminUserResponse changeRole(Long userId, String newRoleStr) {
        User user = findUser(userId);

        String currentUsername = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        if (user.getUsername().equals(currentUsername)) {
            throw new RuntimeException("Bạn không thể đổi role của chính mình!");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(newRoleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Role không hợp lệ: " + newRoleStr + ". Chỉ chấp nhận USER hoặc ADMIN.");
        }

        if (user.getRole() == newRole) {
            throw new RuntimeException("Tài khoản đã có role " + newRole + " rồi!");
        }

        user.setRole(newRole);
        log.info("[Admin] Đổi role userId={} → {} bởi admin={}",
                userId, newRole, currentUsername);

        return AdminUserResponse.from(userRepository.save(user));
    }

    // ── Thống kê tổng quan ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminUserStatsResponse getStats() {
        long totalUsers  = userRepository.count();
        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long locked      = userRepository.countByLocked(true);
        long active      = totalUsers - locked;

        return new AdminUserStatsResponse(totalUsers, totalAdmins, locked, active);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy người dùng id: " + userId));
    }

    private Pageable buildPageable(AdminUserFilterRequest filter) {
        Sort sort = switch (filter.getSortBy() != null ? filter.getSortBy() : "newest") {
            case "oldest"       -> Sort.by("createdAt").ascending();
            case "username_asc" -> Sort.by("username").ascending();
            case "username_desc"-> Sort.by("username").descending();
            default             -> Sort.by("createdAt").descending(); // newest
        };
        int page = Math.max(filter.getPage(), 0);
        int size = (filter.getSize() > 0 && filter.getSize() <= 100) ? filter.getSize() : 10;
        return PageRequest.of(page, size, sort);
    }

    private Role parseRole(String roleStr) {
        if (roleStr == null || roleStr.isBlank()) return null;
        try {
            return Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Role không hợp lệ: " + roleStr);
        }
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
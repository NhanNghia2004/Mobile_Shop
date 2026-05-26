package com.example.backend.admin.user.controller;

import com.example.backend.admin.user.dto.*;
import com.example.backend.admin.user.service.AdminUserService;
import com.example.backend.product.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    // ── GET /api/admin/users ─────────────────────────────────────────────────
    // Danh sách user với tìm kiếm + lọc + phân trang
    //
    // Query params:
    //   keyword  — tìm theo username / email / phone
    //   role     — USER | ADMIN (không truyền = tất cả)
    //   locked   — true | false  (không truyền = tất cả)
    //   sortBy   — newest (default) | oldest | username_asc | username_desc
    //   page     — 0-based (default 0)
    //   size     — số bản ghi / trang (default 10)

    @GetMapping
    public ResponseEntity<PageResponse<AdminUserResponse>> getUsers(
            @RequestParam(required = false)                          String  keyword,
            @RequestParam(required = false)                          String  role,
            @RequestParam(required = false)                          Boolean locked,
            @RequestParam(defaultValue = "newest")                   String  sortBy,
            @RequestParam(defaultValue = "0")                        int     page,
            @RequestParam(defaultValue = "10")                       int     size
    ) {
        AdminUserFilterRequest filter = new AdminUserFilterRequest();
        filter.setKeyword(keyword);
        filter.setRole(role);
        filter.setLocked(locked);
        filter.setSortBy(sortBy);
        filter.setPage(page);
        filter.setSize(size);

        return ResponseEntity.ok(adminUserService.getUsers(filter));
    }

    // ── GET /api/admin/users/stats ───────────────────────────────────────────
    // Thống kê tổng quan: tổng users, admins, đang khóa, đang hoạt động

    @GetMapping("/stats")
    public ResponseEntity<AdminUserStatsResponse> getStats() {
        return ResponseEntity.ok(adminUserService.getStats());
    }

    // ── GET /api/admin/users/{id} ────────────────────────────────────────────
    // Chi tiết 1 user

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUserDetail(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUserDetail(id));
    }

    // ── PATCH /api/admin/users/{id}/lock ────────────────────────────────────
    // Khóa tài khoản
    // Body: { "reason": "Vi phạm điều khoản sử dụng" }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<AdminUserResponse> lockUser(
            @PathVariable Long id,
            @RequestBody LockUserRequest request
    ) {
        return ResponseEntity.ok(adminUserService.lockUser(id, request));
    }

    // ── PATCH /api/admin/users/{id}/unlock ──────────────────────────────────
    // Mở khóa tài khoản

    @PatchMapping("/{id}/unlock")
    public ResponseEntity<AdminUserResponse> unlockUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.unlockUser(id));
    }

    // ── PATCH /api/admin/users/{id}/role ────────────────────────────────────
    // Đổi role
    // Body: { "role": "ADMIN" }

    @PatchMapping("/{id}/role")
    public ResponseEntity<AdminUserResponse> changeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            throw new RuntimeException("Thiếu trường 'role'!");
        }
        return ResponseEntity.ok(adminUserService.changeRole(id, newRole));
    }
}
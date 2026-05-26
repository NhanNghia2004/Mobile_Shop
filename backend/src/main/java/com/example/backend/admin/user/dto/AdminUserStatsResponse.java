package com.example.backend.admin.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminUserStatsResponse {
    private long totalUsers;
    private long totalAdmins;
    private long lockedUsers;
    private long activeUsers;
}
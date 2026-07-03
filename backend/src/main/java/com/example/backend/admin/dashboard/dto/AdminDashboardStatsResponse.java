package com.example.backend.admin.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardStatsResponse {
    private long totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalUsers;
    private List<DailyRevenue> revenueByDate;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyRevenue {
        private String date;
        private long revenue;
    }
}

package com.example.backend.admin.dashboard.service;

import com.example.backend.admin.dashboard.dto.AdminDashboardStatsResponse;
import com.example.backend.admin.dashboard.dto.AdminDashboardStatsResponse.DailyRevenue;
import com.example.backend.order.entity.Order;
import com.example.backend.order.entity.OrderStatus;
import com.example.backend.order.repository.OrderRepository;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AdminDashboardStatsResponse getDashboardStats() {
        AdminDashboardStatsResponse response = new AdminDashboardStatsResponse();

        // 1. Total counts
        response.setTotalOrders(orderRepository.count());
        response.setTotalProducts(productRepository.count());
        response.setTotalUsers(userRepository.count());

        // 2. Total Revenue (only DELIVERED orders)
        Double totalRev = orderRepository.sumTotalPriceByStatus(OrderStatus.DELIVERED);
        response.setTotalRevenue(totalRev != null ? totalRev.longValue() : 0L);

        // 3. Revenue by Date (Last 7 days)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(6).with(LocalTime.MIN);
        List<Order> recentDeliveredOrders = orderRepository.findByStatusAndCreatedAtAfter(OrderStatus.DELIVERED, sevenDaysAgo);

        Map<String, Long> revenueMap = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");

        // Initialize last 7 days with 0
        for (int i = 6; i >= 0; i--) {
            String dateStr = LocalDate.now().minusDays(i).format(formatter);
            revenueMap.put(dateStr, 0L);
        }

        // Aggregate revenue
        for (Order order : recentDeliveredOrders) {
            String dateStr = order.getCreatedAt().format(formatter);
            if (revenueMap.containsKey(dateStr)) {
                revenueMap.put(dateStr, revenueMap.get(dateStr) + order.getTotalAmount().longValue());
            }
        }

        // Convert to list sorted by date
        List<DailyRevenue> revenueByDate = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String dateStr = LocalDate.now().minusDays(i).format(formatter);
            revenueByDate.add(new DailyRevenue(dateStr, revenueMap.get(dateStr)));
        }

        response.setRevenueByDate(revenueByDate);

        return response;
    }
}

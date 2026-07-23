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

    public AdminDashboardStatsResponse getDashboardStats(String period) {
        AdminDashboardStatsResponse response = new AdminDashboardStatsResponse();

        // 1. Total counts (All time)
        response.setTotalOrders(orderRepository.count());
        response.setTotalProducts(productRepository.count());
        response.setTotalUsers(userRepository.count());

        Double totalRev = orderRepository.sumTotalPriceByStatus(OrderStatus.DELIVERED);
        response.setTotalRevenue(totalRev != null ? totalRev.longValue() : 0L);

        // 2. Determine start date and formatter based on period
        LocalDateTime startDate;
        DateTimeFormatter formatter;
        int daysOrMonthsToSubtract = 0;
        boolean isMonthGrouping = false;

        if ("1year".equalsIgnoreCase(period)) {
            startDate = LocalDateTime.now().minusMonths(11).withDayOfMonth(1).with(LocalTime.MIN);
            formatter = DateTimeFormatter.ofPattern("MM/yyyy");
            daysOrMonthsToSubtract = 11;
            isMonthGrouping = true;
        } else if ("1month".equalsIgnoreCase(period)) {
            startDate = LocalDateTime.now().minusDays(29).with(LocalTime.MIN);
            formatter = DateTimeFormatter.ofPattern("dd/MM");
            daysOrMonthsToSubtract = 29;
        } else {
            // Default 7 days
            startDate = LocalDateTime.now().minusDays(6).with(LocalTime.MIN);
            formatter = DateTimeFormatter.ofPattern("dd/MM");
            daysOrMonthsToSubtract = 6;
        }

        // 3. Revenue by Date for the period
        List<Order> periodDeliveredOrders = orderRepository.findByStatusAndCreatedAtAfter(OrderStatus.DELIVERED, startDate);
        
        Map<String, Long> revenueMap = new LinkedHashMap<>();
        
        // Initialize map with 0s to preserve order
        if (isMonthGrouping) {
            for (int i = daysOrMonthsToSubtract; i >= 0; i--) {
                String dateStr = LocalDate.now().minusMonths(i).format(formatter);
                revenueMap.put(dateStr, 0L);
            }
        } else {
            for (int i = daysOrMonthsToSubtract; i >= 0; i--) {
                String dateStr = LocalDate.now().minusDays(i).format(formatter);
                revenueMap.put(dateStr, 0L);
            }
        }

        for (Order order : periodDeliveredOrders) {
            String dateStr = order.getCreatedAt().format(formatter);
            if (revenueMap.containsKey(dateStr)) {
                revenueMap.put(dateStr, revenueMap.get(dateStr) + order.getTotalAmount().longValue());
            }
        }

        List<DailyRevenue> revenueByDate = new ArrayList<>();
        for (Map.Entry<String, Long> entry : revenueMap.entrySet()) {
            revenueByDate.add(new DailyRevenue(entry.getKey(), entry.getValue()));
        }
        response.setRevenueByDate(revenueByDate);

        // 4. Orders by Status for the pie chart (for the selected period)
        List<Order> periodOrders = orderRepository.findByCreatedAtAfter(startDate);
        Map<OrderStatus, Long> statusCountMap = periodOrders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));

        List<AdminDashboardStatsResponse.OrderStatusStat> ordersByStatus = new ArrayList<>();
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.add(new AdminDashboardStatsResponse.OrderStatusStat(
                    status.name(),
                    statusCountMap.getOrDefault(status, 0L)
            ));
        }
        response.setOrdersByStatus(ordersByStatus);

        return response;
    }
}

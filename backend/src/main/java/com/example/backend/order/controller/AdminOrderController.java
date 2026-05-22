package com.example.backend.order.controller;

import com.example.backend.order.dto.OrderResponse;
import com.example.backend.order.entity.OrderStatus;
import com.example.backend.order.service.OrderService;
import com.example.backend.product.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin(page, size));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}

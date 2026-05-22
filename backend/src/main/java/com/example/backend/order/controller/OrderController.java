package com.example.backend.order.controller;

import com.example.backend.order.dto.OrderRequest;
import com.example.backend.order.dto.OrderResponse;
import com.example.backend.order.service.OrderService;
import com.example.backend.product.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.checkout(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getUserOrders(userDetails.getUsername(), page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderDetails(userDetails.getUsername(), id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(userDetails.getUsername(), id));
    }
}

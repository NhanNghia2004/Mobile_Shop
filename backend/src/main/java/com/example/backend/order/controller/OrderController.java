package com.example.backend.order.controller;

import com.example.backend.order.dto.OrderRequest;
import com.example.backend.order.dto.OrderResponse;
import com.example.backend.order.service.OrderService;
import com.example.backend.payment.dto.VNPayResponse;
import com.example.backend.payment.service.VNPayService;
import com.example.backend.product.dto.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService  orderService;
    private final VNPayService  vnPayService;

    // Checkout COD (giữ nguyên)

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.checkout(userDetails.getUsername(), request));
    }

    // Checkout + tạo URL VNPay (1 bước)


    @PostMapping("/checkout/vnpay")
    public ResponseEntity<Map<String, Object>> checkoutWithVNPay(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody OrderRequest request,
            HttpServletRequest httpRequest
    ) {
        // Bước 1: Tạo đơn hàng (paymentMethod = "VNPAY")
        request.setPaymentMethod("VNPAY");
        OrderResponse order = orderService.checkout(userDetails.getUsername(), request);

        // Bước 2: Tạo URL thanh toán VNPay
        String clientIp  = getClientIp(httpRequest);
        String orderInfo = "Thanh toan don hang " + order.getId();
        VNPayResponse vnpay = vnPayService.createPaymentUrl(order.getId(), clientIp, orderInfo);

        Map<String, Object> result = new HashMap<>();
        result.put("order",      order);
        result.put("vnpayCode",  vnpay.getCode());
        result.put("paymentUrl", vnpay.getPaymentUrl());
        result.put("message",    vnpay.getMessage());

        return ResponseEntity.ok(result);
    }

    //Các endpoint hiện có

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> getUserOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0")  int page,
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

    // Helper

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
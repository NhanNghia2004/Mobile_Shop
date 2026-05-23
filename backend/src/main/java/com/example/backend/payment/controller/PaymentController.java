package com.example.backend.payment.controller;

import com.example.backend.payment.dto.VNPayIpnResponse;
import com.example.backend.payment.dto.VNPayResponse;
import com.example.backend.payment.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // ─── 1. Tạo URL thanh toán VNPay ──────────────────────────────────────

    /**
     * POST /api/payment/vnpay/create
     * Body: { "orderId": 123, "orderInfo": "..." }
     * Trả về { "code": "00", "paymentUrl": "https://sandbox.vnpayment.vn/..." }
     */
    @PostMapping("/vnpay/create")
    public ResponseEntity<VNPayResponse> createPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request
    ) {
        Long   orderId   = Long.valueOf(body.get("orderId").toString());
        String orderInfo = (String) body.getOrDefault("orderInfo", "");
        String clientIp  = getClientIp(request);

        VNPayResponse response = vnPayService.createPaymentUrl(orderId, clientIp, orderInfo);
        return ResponseEntity.ok(response);
    }

    // ─── 2. Return URL — VNPay redirect user về sau khi thanh toán ─────────

    /**
     * GET /api/payment/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=...&...
     * VNPay redirect browser của user về đây sau khi thanh toán.
     * Server xử lý kết quả rồi redirect tiếp về frontend.
     */
    @GetMapping("/vnpay/return")
    public ResponseEntity<Void> handleReturn(
            @RequestParam Map<String, String> allParams,
            HttpServletRequest request
    ) {
        Map<String, String> params = new HashMap<>(allParams);
        Map<String, String> result = vnPayService.processReturnUrl(params);

        String status  = result.getOrDefault("status", "FAILED");
        String orderId = result.getOrDefault("orderId", "");
        String code    = result.getOrDefault("responseCode", "");

        // Redirect về trang kết quả của frontend
        String redirectUrl = frontendUrl
                + "/payment/result"
                + "?status=" + status
                + "&orderId=" + orderId
                + "&code=" + code;

        return ResponseEntity.status(302)
                .location(URI.create(redirectUrl))
                .build();
    }

    // ─── 3. IPN — VNPay gọi server-to-server để xác nhận ──────────────────

    /**
     * GET /api/payment/vnpay/ipn?vnp_ResponseCode=00&...
     * VNPay gọi server-to-server (không qua browser).
     * Phải phản hồi trong vòng 5 giây.
     */
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<VNPayIpnResponse> handleIpn(
            @RequestParam Map<String, String> allParams
    ) {
        Map<String, String> params = new HashMap<>(allParams);
        VNPayIpnResponse response = vnPayService.processIpn(params);
        return ResponseEntity.ok(response);
    }

    // ─── 4. Lấy trạng thái thanh toán theo orderId ─────────────────────────

    /**
     * GET /api/payment/status/{orderId}
     * User hoặc Admin kiểm tra trạng thái thanh toán của đơn hàng.
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(vnPayService.getPaymentStatus(orderId));
    }

    // ─── Helper ────────────────────────────────────────────────────────────

    /**
     * Lấy IP thực của client (hỗ trợ proxy/load balancer).
     */
    private String getClientIp(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For", "Proxy-Client-IP",
                "WL-Proxy-Client-IP", "HTTP_X_FORWARDED_FOR",
                "HTTP_X_FORWARDED", "HTTP_FORWARDED_FOR",
                "HTTP_FORWARDED", "HTTP_CLIENT_IP"
        };
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim(); // Lấy IP đầu tiên nếu có nhiều
            }
        }
        return request.getRemoteAddr();
    }
}
package com.example.backend.payment.service;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.order.entity.Order;
import com.example.backend.order.entity.OrderStatus;
import com.example.backend.order.repository.OrderRepository;
import com.example.backend.payment.config.VNPayConfig;
import com.example.backend.payment.dto.VNPayIpnResponse;
import com.example.backend.payment.dto.VNPayResponse;
import com.example.backend.payment.entity.Payment;
import com.example.backend.payment.entity.PaymentStatus;
import com.example.backend.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig vnPayConfig;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public VNPayResponse createPaymentUrl(Long orderId, String clientIp, String orderInfo) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng id: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return new VNPayResponse("01", "Đơn hàng đã bị hủy, không thể thanh toán!", null);
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            return new VNPayResponse("02", "Đơn hàng đã hoàn thành!", null);
        }
        if (paymentRepository.existsByOrderIdAndStatus(orderId, PaymentStatus.SUCCESS)) {
            return new VNPayResponse("03", "Đơn hàng đã được thanh toán thành công!", null);
        }

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(Payment::new);

        String txnRef = payment.getTxnRef();
        if (txnRef == null || txnRef.isBlank()) {
            txnRef = buildTxnRef(orderId);
            payment.setTxnRef(txnRef);
        }

        payment.setOrder(order);
        payment.setAmount(Math.round(order.getTotalAmount()));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setOrderInfo(
                orderInfo != null && !orderInfo.isBlank()
                        ? orderInfo
                        : "Thanh toan don hang " + orderId);
        paymentRepository.save(payment);

        String vnpAmount = String.valueOf(Math.round(order.getTotalAmount()) * 100L);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String createDate = formatter.format(new Date());
        String expireDate = buildExpireDate(15);

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", vnPayConfig.getVersion());
        params.put("vnp_Command", vnPayConfig.getCommand());
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        params.put("vnp_Amount", vnpAmount);
        params.put("vnp_CurrCode", vnPayConfig.getCurrencyCode());
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", payment.getOrderInfo());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", vnPayConfig.getLocale());
        params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        String ipAddr = clientIp != null ? clientIp : "127.0.0.1";
        if ("0:0:0:0:0:0:0:1".equals(ipAddr) || "::1".equals(ipAddr)) {
            ipAddr = "127.0.0.1";
        }
        params.put("vnp_IpAddr", ipAddr);
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        if (vnPayConfig.getIpnUrl() != null && !vnPayConfig.getIpnUrl().isBlank()) {
            params.put("vnp_NotifyUrl", vnPayConfig.getIpnUrl());
        }

        String queryString = buildQueryString(params);
        String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        log.info("[VNPay] Tạo URL thanh toán | orderId={} txnRef={}", orderId, txnRef);
        log.info("[VNPay] ReturnUrl được dùng: {}", vnPayConfig.getReturnUrl());
        log.info("[VNPay] PaymentUrl: {}", paymentUrl);
        return new VNPayResponse("00", "Tạo URL thanh toán thành công!", paymentUrl);
    }

    @Transactional
    public Map<String, String> processReturnUrl(Map<String, String> vnpParams) {
        Map<String, String> result = new HashMap<>();

        TreeMap<String, String> params = new TreeMap<>(vnpParams);
        String secureHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String queryString = buildQueryString(params);
        String computedHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);

        if (secureHash == null || secureHash.isBlank() || !computedHash.equalsIgnoreCase(secureHash)) {
            log.warn("[VNPay] Return URL - Chữ ký không hợp lệ! computed={} received={}", computedHash, secureHash);
            result.put("status", "INVALID_SIGNATURE");
            result.put("message", "Chữ ký không hợp lệ!");
            return result;
        }

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");

        updatePaymentFromVNPay(txnRef, responseCode, params);

        if ("00".equals(responseCode)) {
            result.put("status", "SUCCESS");
            result.put("message", "Thanh toán thành công!");
        } else {
            result.put("status", "FAILED");
            result.put("message", "Thanh toán thất bại! Mã lỗi: " + responseCode);
        }

        result.put("txnRef", txnRef);
        result.put("responseCode", responseCode);
        result.put("orderId", extractOrderId(txnRef));
        return result;
    }

    @Transactional
    public VNPayIpnResponse processIpn(Map<String, String> vnpParams) {
        TreeMap<String, String> params = new TreeMap<>(vnpParams);
        String receivedHash = params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String queryString = buildQueryString(params);
        String computedHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);

        if (receivedHash == null || !computedHash.equalsIgnoreCase(receivedHash)) {
            log.warn("[VNPay] IPN - Chữ ký không hợp lệ!");
            return new VNPayIpnResponse("97", "Invalid Signature");
        }

        String txnRef = params.get("vnp_TxnRef");
        String vnpAmount = params.get("vnp_Amount");
        String responseCode = params.get("vnp_ResponseCode");

        Optional<Payment> paymentOpt = paymentRepository.findByTxnRef(txnRef);
        if (paymentOpt.isEmpty()) {
            log.warn("[VNPay] IPN - Không tìm thấy giao dịch txnRef={}", txnRef);
            return new VNPayIpnResponse("01", "Order Not Found");
        }

        Payment payment = paymentOpt.get();

        long expectedAmount = payment.getAmount() * 100L;
        try {
            long receivedAmount = Long.parseLong(vnpAmount);
            if (receivedAmount != expectedAmount) {
                log.warn("[VNPay] IPN - Số tiền không khớp | expected={} received={}", expectedAmount, receivedAmount);
                return new VNPayIpnResponse("04", "Invalid Amount");
            }
        } catch (NumberFormatException e) {
            return new VNPayIpnResponse("04", "Invalid Amount");
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return new VNPayIpnResponse("02", "Order Already Confirmed");
        }

        updatePaymentFromVNPay(txnRef, responseCode, params);
        log.info("[VNPay] IPN xử lý thành công | txnRef={} responseCode={}", txnRef, responseCode);
        return new VNPayIpnResponse("00", "Confirm Success");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentStatus(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thông tin thanh toán cho đơn hàng id: " + orderId));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", orderId);
        result.put("txnRef", payment.getTxnRef());
        result.put("amount", payment.getAmount());
        result.put("status", payment.getStatus().name());
        result.put("responseCode", payment.getVnpResponseCode());
        result.put("transactionNo", payment.getVnpTransactionNo());
        result.put("bankCode", payment.getBankCode());
        result.put("cardType", payment.getCardType());
        result.put("payDate", payment.getPayDate());
        result.put("orderInfo", payment.getOrderInfo());
        result.put("createdAt", payment.getCreatedAt());
        result.put("updatedAt", payment.getUpdatedAt());
        return result;
    }

    private void updatePaymentFromVNPay(String txnRef, String responseCode,
                                        Map<String, String> params) {
        paymentRepository.findByTxnRef(txnRef).ifPresent(payment -> {
            payment.setVnpResponseCode(responseCode);
            payment.setVnpTransactionNo(params.get("vnp_TransactionNo"));
            payment.setBankCode(params.get("vnp_BankCode"));
            payment.setCardType(params.get("vnp_CardType"));
            payment.setPayDate(params.get("vnp_PayDate"));

            if ("00".equals(responseCode)) {
                payment.setStatus(PaymentStatus.SUCCESS);
                Order order = payment.getOrder();
                if (order.getStatus() == OrderStatus.PENDING) {
                    order.setStatus(OrderStatus.PROCESSING);
                    orderRepository.save(order);
                }
            } else {
                payment.setStatus(PaymentStatus.FAILED);
            }

            paymentRepository.save(payment);
            log.info("[VNPay] Cập nhật payment | txnRef={} status={}", txnRef, payment.getStatus());
        });
    }

    private String buildTxnRef(Long orderId) {
        return orderId + "_" + System.currentTimeMillis();
    }

    private String extractOrderId(String txnRef) {
        if (txnRef == null) return "";
        int idx = txnRef.indexOf('_');
        return idx > 0 ? txnRef.substring(0, idx) : txnRef;
    }

    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        try {
            for (Map.Entry<String, String> entry : params.entrySet()) {
                if (entry.getValue() != null && !entry.getValue().isBlank()) {
                    if (sb.length() > 0) sb.append('&');
                    sb.append(entry.getKey());
                    sb.append('=');
                    sb.append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
                }
            }
        } catch (Exception e) {
            log.error("Lỗi encode query string", e);
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                hex.append(String.format("%02x", b & 0xff));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tính HMAC-SHA512: " + e.getMessage(), e);
        }
    }

    private String buildExpireDate(int minutes) {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        cal.add(Calendar.MINUTE, minutes);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        return sdf.format(cal.getTime());
    }
}
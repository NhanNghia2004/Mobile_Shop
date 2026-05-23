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

    private final VNPayConfig       vnPayConfig;
    private final PaymentRepository paymentRepository;
    private final OrderRepository   orderRepository;

    // ─── TẠO URL THANH TOÁN ─────────────────────────────────────────────────

    /**
     * Tạo URL redirect đến cổng thanh toán VNPay.
     *
     * @param orderId   ID đơn hàng trong DB
     * @param clientIp  IP của người dùng
     * @param orderInfo Mô tả ngắn về đơn hàng
     * @return VNPayResponse chứa paymentUrl
     */
    @Transactional
    public VNPayResponse createPaymentUrl(Long orderId, String clientIp, String orderInfo) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng id: " + orderId));

        // Kiểm tra đơn hàng hợp lệ để thanh toán
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return new VNPayResponse("01", "Đơn hàng đã bị hủy, không thể thanh toán!", null);
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            return new VNPayResponse("02", "Đơn hàng đã hoàn thành!", null);
        }

        // Kiểm tra đã thanh toán thành công chưa
        if (paymentRepository.existsByOrderIdAndStatus(orderId, PaymentStatus.SUCCESS)) {
            return new VNPayResponse("03", "Đơn hàng đã được thanh toán thành công!", null);
        }

        // Tạo hoặc cập nhật bản ghi Payment (PENDING)
        String txnRef = buildTxnRef(orderId);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(Payment::new);

        payment.setOrder(order);
        payment.setTxnRef(txnRef);
        payment.setAmount(Math.round(order.getTotalAmount()));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setOrderInfo(
                orderInfo != null && !orderInfo.isBlank()
                        ? orderInfo
                        : "Thanh toan don hang " + orderId
        );
        paymentRepository.save(payment);

        // Xây dựng params gửi VNPay
        String vnpAmount   = String.valueOf(Math.round(order.getTotalAmount()) * 100L);
        String createDate  = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String expireDate  = buildExpireDate(15);  // hết hạn sau 15 phút

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version",    vnPayConfig.getVersion());
        params.put("vnp_Command",    vnPayConfig.getCommand());
        params.put("vnp_TmnCode",    vnPayConfig.getTmnCode());
        params.put("vnp_Amount",     vnpAmount);
        params.put("vnp_CurrCode",   vnPayConfig.getCurrencyCode());
        params.put("vnp_TxnRef",     txnRef);
        params.put("vnp_OrderInfo",  payment.getOrderInfo());
        params.put("vnp_OrderType",  "other");
        params.put("vnp_Locale",     vnPayConfig.getLocale());
        params.put("vnp_ReturnUrl",  vnPayConfig.getReturnUrl());
        params.put("vnp_IpAddr",     clientIp != null ? clientIp : "127.0.0.1");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        // Thêm IPN URL nếu có cấu hình
        if (vnPayConfig.getIpnUrl() != null && !vnPayConfig.getIpnUrl().isBlank()) {
            params.put("vnp_NotifyUrl", vnPayConfig.getIpnUrl());
        }

        String queryString = buildQueryString(params);
        String secureHash  = hmacSHA512(vnPayConfig.getHashSecret(), queryString);
        String paymentUrl  = vnPayConfig.getPayUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;

        log.info("[VNPay] Tạo URL thanh toán | orderId={} txnRef={}", orderId, txnRef);
        return new VNPayResponse("00", "Tạo URL thanh toán thành công!", paymentUrl);
    }

    // ─── XỬ LÝ RETURN URL (sau khi user thanh toán xong) ───────────────────

    /**
     * Xử lý kết quả VNPay trả về qua returnUrl (hiển thị cho user).
     * Trả về map kết quả để controller redirect về frontend.
     */
    @Transactional
    public Map<String, String> processReturnUrl(Map<String, String> vnpParams) {
        Map<String, String> result = new HashMap<>();

        String secureHash = vnpParams.remove("vnp_SecureHash");
        vnpParams.remove("vnp_SecureHashType");

        // Xác minh chữ ký
        String queryString = buildQueryString(new TreeMap<>(vnpParams));
        String computedHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);

        if (!computedHash.equalsIgnoreCase(secureHash)) {
            log.warn("[VNPay] Return URL - Chữ ký không hợp lệ!");
            result.put("status", "INVALID_SIGNATURE");
            result.put("message", "Chữ ký không hợp lệ!");
            return result;
        }

        String responseCode = vnpParams.get("vnp_ResponseCode");
        String txnRef       = vnpParams.get("vnp_TxnRef");

        updatePaymentFromVNPay(txnRef, responseCode, vnpParams);

        if ("00".equals(responseCode)) {
            result.put("status",  "SUCCESS");
            result.put("message", "Thanh toán thành công!");
        } else {
            result.put("status",  "FAILED");
            result.put("message", "Thanh toán thất bại! Mã lỗi: " + responseCode);
        }

        result.put("txnRef",       txnRef);
        result.put("responseCode", responseCode);
        result.put("orderId",      extractOrderId(txnRef));
        return result;
    }

    // ─── IPN (VNPay gọi server-to-server) ───────────────────────────────────

    /**
     * VNPay gọi IPN URL để xác nhận thanh toán (server-to-server, không qua browser).
     * Phải trả về JSON { RspCode, Message } trong vòng 5 giây.
     */
    @Transactional
    public VNPayIpnResponse processIpn(Map<String, String> vnpParams) {
        String receivedHash = vnpParams.remove("vnp_SecureHash");
        vnpParams.remove("vnp_SecureHashType");

        String queryString  = buildQueryString(new TreeMap<>(vnpParams));
        String computedHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);

        if (!computedHash.equalsIgnoreCase(receivedHash)) {
            log.warn("[VNPay] IPN - Chữ ký không hợp lệ!");
            return new VNPayIpnResponse("97", "Invalid Signature");
        }

        String txnRef      = vnpParams.get("vnp_TxnRef");
        String vnpAmount   = vnpParams.get("vnp_Amount");
        String responseCode = vnpParams.get("vnp_ResponseCode");

        Optional<Payment> paymentOpt = paymentRepository.findByTxnRef(txnRef);
        if (paymentOpt.isEmpty()) {
            log.warn("[VNPay] IPN - Không tìm thấy giao dịch txnRef={}", txnRef);
            return new VNPayIpnResponse("01", "Order Not Found");
        }

        Payment payment = paymentOpt.get();

        // Kiểm tra số tiền khớp
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

        // Đã xử lý rồi thì bỏ qua
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return new VNPayIpnResponse("02", "Order Already Confirmed");
        }

        updatePaymentFromVNPay(txnRef, responseCode, vnpParams);
        log.info("[VNPay] IPN xử lý thành công | txnRef={} responseCode={}", txnRef, responseCode);
        return new VNPayIpnResponse("00", "Confirm Success");
    }

    // ─── QUERY TRẠNG THÁI PAYMENT THEO ORDER ────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentStatus(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy thông tin thanh toán cho đơn hàng id: " + orderId));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId",           orderId);
        result.put("txnRef",            payment.getTxnRef());
        result.put("amount",            payment.getAmount());
        result.put("status",            payment.getStatus().name());
        result.put("responseCode",      payment.getVnpResponseCode());
        result.put("transactionNo",     payment.getVnpTransactionNo());
        result.put("bankCode",          payment.getBankCode());
        result.put("cardType",          payment.getCardType());
        result.put("payDate",           payment.getPayDate());
        result.put("orderInfo",         payment.getOrderInfo());
        result.put("createdAt",         payment.getCreatedAt());
        result.put("updatedAt",         payment.getUpdatedAt());
        return result;
    }

    // ─── PRIVATE HELPERS ────────────────────────────────────────────────────

    /**
     * Cập nhật Payment + OrderStatus sau khi nhận kết quả từ VNPay.
     */
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

                // Cập nhật trạng thái đơn hàng → PROCESSING
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

    /**
     * Xây dựng txnRef: "{orderId}_{timestamp}" để đảm bảo duy nhất khi thử lại.
     */
    private String buildTxnRef(Long orderId) {
        return orderId + "_" + System.currentTimeMillis();
    }

    /**
     * Tách orderId từ txnRef (định dạng: "orderId_timestamp").
     */
    private String extractOrderId(String txnRef) {
        if (txnRef == null) return "";
        int idx = txnRef.indexOf('_');
        return idx > 0 ? txnRef.substring(0, idx) : txnRef;
    }

    /**
     * Tạo chuỗi query string đã URL-encode (key=value&key=value).
     */
    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isBlank()) {
                if (sb.length() > 0) sb.append('&');
                sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII));
                sb.append('=');
                sb.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            }
        }
        return sb.toString();
    }

    /**
     * Tính HMAC-SHA512.
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tính HMAC-SHA512: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo thời gian hết hạn (yyyyMMddHHmmss), cộng thêm `minutes` phút.
     */
    private String buildExpireDate(int minutes) {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        cal.add(Calendar.MINUTE, minutes);
        return new SimpleDateFormat("yyyyMMddHHmmss").format(cal.getTime());
    }
}
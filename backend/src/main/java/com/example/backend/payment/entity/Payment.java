package com.example.backend.payment.entity;

import com.example.backend.order.entity.Order;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    // Mã giao dịch của VNPay (vnp_TxnRef) — cũng chính là orderId ở đây
    @Column(nullable = false, unique = true)
    private String txnRef;

    // Số tiền (VND, không nhân 100)
    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    // Mã phản hồi từ VNPay sau khi thanh toán ("00" = thành công)
    private String vnpResponseCode;

    // Mã giao dịch phía ngân hàng do VNPay trả về
    private String vnpTransactionNo;

    // Ngân hàng
    private String bankCode;

    // Loại thẻ: ATM / QRCODE / IB / ...
    private String cardType;

    // Thời điểm thanh toán (theo VNPay)
    private String payDate;

    // Thông tin đơn hàng gửi lên VNPay
    @Column(length = 512)
    private String orderInfo;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
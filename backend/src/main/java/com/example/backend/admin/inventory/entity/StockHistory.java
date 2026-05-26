package com.example.backend.admin.inventory.entity;

import com.example.backend.product.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_histories")
@Data
@NoArgsConstructor
public class StockHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockChangeType changeType;

    /** Số lượng thay đổi (dương = nhập, âm = xuất/trừ) */
    @Column(nullable = false)
    private Integer quantityChanged;

    /** Tồn kho trước khi thay đổi */
    @Column(nullable = false)
    private Integer quantityBefore;

    /** Tồn kho sau khi thay đổi */
    @Column(nullable = false)
    private Integer quantityAfter;

    /** Admin hoặc hệ thống thực hiện thay đổi */
    @Column(nullable = false)
    private String changedBy;

    /** Ghi chú (lý do nhập kho, mã đơn hàng, ...) */
    @Column(length = 500)
    private String note;

    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public StockHistory(ProductVariant variant,
                        StockChangeType changeType,
                        int quantityChanged,
                        int quantityBefore,
                        int quantityAfter,
                        String changedBy,
                        String note) {
        this.variant         = variant;
        this.changeType      = changeType;
        this.quantityChanged = quantityChanged;
        this.quantityBefore  = quantityBefore;
        this.quantityAfter   = quantityAfter;
        this.changedBy       = changedBy;
        this.note            = note;
    }
}
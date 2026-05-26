package com.example.backend.admin.inventory.dto;

import com.example.backend.admin.inventory.entity.StockChangeType;
import com.example.backend.admin.inventory.entity.StockHistory;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StockHistoryResponse {

    private Long            id;
    private Long            variantId;
    private String          variantColor;
    private Integer         variantStorage;
    private Long            productId;
    private String          productName;
    private StockChangeType changeType;
    private Integer         quantityChanged;
    private Integer         quantityBefore;
    private Integer         quantityAfter;
    private String          changedBy;
    private String          note;
    private LocalDateTime   createdAt;

    public static StockHistoryResponse from(StockHistory sh) {
        StockHistoryResponse dto = new StockHistoryResponse();
        dto.setId(sh.getId());
        dto.setVariantId(sh.getVariant().getId());
        dto.setVariantColor(sh.getVariant().getColor());
        dto.setVariantStorage(sh.getVariant().getStorage());
        dto.setProductId(sh.getVariant().getProduct().getId());
        dto.setProductName(sh.getVariant().getProduct().getName());
        dto.setChangeType(sh.getChangeType());
        dto.setQuantityChanged(sh.getQuantityChanged());
        dto.setQuantityBefore(sh.getQuantityBefore());
        dto.setQuantityAfter(sh.getQuantityAfter());
        dto.setChangedBy(sh.getChangedBy());
        dto.setNote(sh.getNote());
        dto.setCreatedAt(sh.getCreatedAt());
        return dto;
    }
}
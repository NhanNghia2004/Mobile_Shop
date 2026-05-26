package com.example.backend.admin.inventory.dto;

import lombok.Data;

@Data
public class StockAdjustRequest {
    private Integer newQuantity;
    private String  note;
}
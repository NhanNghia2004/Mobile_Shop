package com.example.backend.admin.product.dto;

import lombok.Data;

import java.util.List;

@Data
public class BulkActionRequest {

    private List<Long> productIds;

    private String action;
}
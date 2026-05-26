package com.example.backend.admin.product.dto;

import lombok.Data;

@Data
public class VariantImageRequest {
    private String  imageUrl;     // URL ảnh (nếu nhập tay)
    private Integer displayOrder; // Thứ tự hiển thị (0, 1, 2, ...)
}
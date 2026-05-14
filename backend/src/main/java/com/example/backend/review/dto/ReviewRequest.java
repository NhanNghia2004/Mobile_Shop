package com.example.backend.review.dto;

import lombok.Data;

// Request tạo / cập nhật review (gửi dạng multipart/form-data)
@Data
public class ReviewRequest {

    private Long variantId;   // variant đã mua
    private Integer rating;   // 1–5
    private String comment;
}
package com.example.backend.admin.review.dto;

import lombok.Data;

@Data
public class AdminReviewFilterRequest {

    private String keyword;

    private Long productId;

    private Integer rating;

    private String status = "all";

    private String type = "all";

    private String sortBy = "newest";

    private int page = 0;
    private int size = 20;
}
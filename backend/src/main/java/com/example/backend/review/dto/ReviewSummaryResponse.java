package com.example.backend.review.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ReviewSummaryResponse {

    private Double avgRating;         // VD: 4.3
    private Long totalReviews;        // Tổng số review
    private Map<Integer, Long> breakdown; // {5: 120, 4: 80, 3: 20, 2: 5, 1: 2}
}
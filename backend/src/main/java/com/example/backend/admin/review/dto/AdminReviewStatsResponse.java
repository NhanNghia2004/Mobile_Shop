package com.example.backend.admin.review.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminReviewStatsResponse {

    private long totalReviews;
    private long visibleReviews;
    private long hiddenReviews;
    private long reviewsWithImages;
    private long reviewsWithReply;
    private long reviewsNoReply;

    private Map<Integer, Long> ratingBreakdown;

    private Double avgRating;
}
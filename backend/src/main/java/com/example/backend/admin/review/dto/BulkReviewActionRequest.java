package com.example.backend.admin.review.dto;

import lombok.Data;

import java.util.List;

@Data
public class BulkReviewActionRequest {

    private List<Long> reviewIds;

    private String action;
}
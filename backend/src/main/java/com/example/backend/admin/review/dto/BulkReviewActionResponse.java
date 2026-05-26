package com.example.backend.admin.review.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class BulkReviewActionResponse {
    private int          successCount;
    private int          failCount;
    private List<String> errors;
    private String       message;
}
package com.example.backend.review.dto;

import com.example.backend.review.entity.Review;
import com.example.backend.review.entity.ReviewStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ReviewResponse {

    private Long id;

    // Thông tin người review
    private Long userId;
    private String username;
    private String userAvatar;

    // Variant đã mua
    private Long variantId;
    private String variantColor;
    private Integer variantStorage;

    private Integer rating;
    private String comment;
    private List<String> imageUrls;

    private ReviewStatus status;
    private String adminReply;
    private LocalDateTime adminRepliedAt;
    private LocalDateTime createdAt;

    public static ReviewResponse from(Review r) {
        ReviewResponse dto = new ReviewResponse();
        dto.setId(r.getId());

        dto.setUserId(r.getUser().getId());
        dto.setUsername(r.getUser().getUsername());
        dto.setUserAvatar(r.getUser().getAvatarUrl());

        dto.setVariantId(r.getVariant().getId());
        dto.setVariantColor(r.getVariant().getColor());
        dto.setVariantStorage(r.getVariant().getStorage());

        dto.setRating(r.getRating());
        dto.setComment(r.getComment());

        dto.setImageUrls(
                r.getImages().stream()
                        .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                        .map(img -> img.getUrl())
                        .collect(Collectors.toList())
        );

        dto.setStatus(r.getStatus());
        dto.setAdminReply(r.getAdminReply());
        dto.setAdminRepliedAt(r.getAdminRepliedAt());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}
package com.example.backend.admin.review.dto;

import com.example.backend.review.entity.Review;
import com.example.backend.review.entity.ReviewStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class AdminReviewResponse {

    private Long   id;

    // Thông tin người review
    private Long   userId;
    private String username;
    private String userEmail;
    private String userAvatar;

    // Thông tin sản phẩm
    private Long   productId;
    private String productName;
    private String productImageUrl;

    // Thông tin variant đã mua
    private Long    variantId;
    private String  variantColor;
    private Integer variantStorage;

    // Nội dung review
    private Integer      rating;
    private String       comment;
    private List<String> imageUrls;
    private boolean      hasImages;

    // Trạng thái & admin reply
    private ReviewStatus  status;
    private String        adminReply;
    private LocalDateTime adminRepliedAt;
    private boolean       hasReply;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminReviewResponse from(Review r) {
        AdminReviewResponse dto = new AdminReviewResponse();
        dto.setId(r.getId());

        // User
        dto.setUserId(r.getUser().getId());
        dto.setUsername(r.getUser().getUsername());
        dto.setUserEmail(r.getUser().getEmail());
        dto.setUserAvatar(r.getUser().getAvatarUrl());

        // Product
        dto.setProductId(r.getProduct().getId());
        dto.setProductName(r.getProduct().getName());
        dto.setProductImageUrl(r.getProduct().getImageUrl());

        // Variant
        dto.setVariantId(r.getVariant().getId());
        dto.setVariantColor(r.getVariant().getColor());
        dto.setVariantStorage(r.getVariant().getStorage());

        // Content
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());

        List<String> urls = r.getImages().stream()
                .sorted(java.util.Comparator.comparingInt(
                        com.example.backend.review.entity.ReviewImage::getSortOrder))
                .map(com.example.backend.review.entity.ReviewImage::getUrl)
                .collect(Collectors.toList());
        dto.setImageUrls(urls);
        dto.setHasImages(!urls.isEmpty());

        // Status & reply
        dto.setStatus(r.getStatus());
        dto.setAdminReply(r.getAdminReply());
        dto.setAdminRepliedAt(r.getAdminRepliedAt());
        dto.setHasReply(r.getAdminReply() != null && !r.getAdminReply().isBlank());

        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}
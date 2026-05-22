package com.example.backend.favorite.dto;

import com.example.backend.favorite.entity.Favorite;
import lombok.Data;

@Data
public class FavoriteResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String brand;
    private String imageUrl;
    private Double price;
    private Double rating;
    private Integer reviewCount;

    public static FavoriteResponse from(Favorite favorite) {
        FavoriteResponse response = new FavoriteResponse();
        response.setId(favorite.getId());
        response.setProductId(favorite.getProduct().getId());
        response.setProductName(favorite.getProduct().getName());
        response.setBrand(favorite.getProduct().getBrand());
        response.setImageUrl(favorite.getProduct().getImageUrl());
        response.setPrice(favorite.getProduct().getMinPrice());
        response.setRating(favorite.getProduct().getRating());
        response.setReviewCount(favorite.getProduct().getReviewCount());
        return response;
    }
}

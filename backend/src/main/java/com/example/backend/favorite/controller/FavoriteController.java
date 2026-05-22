package com.example.backend.favorite.controller;

import com.example.backend.favorite.dto.FavoriteResponse;
import com.example.backend.favorite.service.FavoriteService;
import com.example.backend.product.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<PageResponse<FavoriteResponse>> getFavorites(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(favoriteService.getFavorites(userDetails.getUsername(), page, size));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Map<String, String>> addFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        favoriteService.addFavorite(userDetails.getUsername(), productId);
        return ResponseEntity.ok(Map.of("message", "Đã thêm vào danh sách yêu thích!"));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, String>> removeFavorite(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        favoriteService.removeFavorite(userDetails.getUsername(), productId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa khỏi danh sách yêu thích!"));
    }
}

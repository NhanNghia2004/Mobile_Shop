package com.example.backend.cart.controller;

import com.example.backend.cart.dto.CartItemRequest;
import com.example.backend.cart.dto.CartResponse;
import com.example.backend.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCart(userDetails.getUsername()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(userDetails.getUsername(), request));
    }

    @PutMapping("/update")
    public ResponseEntity<CartResponse> updateCartItemQuantity(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.updateCartItemQuantity(userDetails.getUsername(), request));
    }

    @DeleteMapping("/remove/{variantId}")
    public ResponseEntity<CartResponse> removeCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long variantId) {
        return ResponseEntity.ok(cartService.removeCartItem(userDetails.getUsername(), variantId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearCart(
            @AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Đã dọn sạch giỏ hàng!"));
    }
}

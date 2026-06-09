package com.example.backend.cart.service;

import com.example.backend.cart.dto.CartItemRequest;
import com.example.backend.cart.dto.CartItemResponse;
import com.example.backend.cart.dto.CartResponse;
import com.example.backend.cart.entity.CartItem;
import com.example.backend.cart.repository.CartItemRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.repository.ProductVariantRepository;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;

    @Transactional(readOnly = true)
    public CartResponse getCart(String username) {
        User user = findUser(username);
        List<CartItem> items = cartItemRepository.findByUserIdWithProductAndVariant(user.getId());

        List<CartItemResponse> itemResponses = items.stream()
                .map(CartItemResponse::from)
                .collect(Collectors.toList());

        Double totalAmount = itemResponses.stream()
                .mapToDouble(CartItemResponse::getSubTotal)
                .sum();

        Integer totalQuantity = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        CartResponse response = new CartResponse();
        response.setItems(itemResponses);
        response.setTotalAmount(totalAmount);
        response.setTotalQuantity(totalQuantity);
        return response;
    }

    @Transactional
    public CartResponse addToCart(String username, CartItemRequest request) {
        User user = findUser(username);
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Biến thể sản phẩm không tồn tại!"));

        if (variant.getStatus() != ProductStatus.ACTIVE) {
            throw new RuntimeException("Sản phẩm hiện tại không khả dụng!");
        }

        int requestedQty = request.getQuantity() != null ? request.getQuantity() : 1;
        if (requestedQty <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0!");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndVariantId(user.getId(), variant.getId());
        CartItem cartItem;

        if (existingItemOpt.isPresent()) {
            cartItem = existingItemOpt.get();
            int newQty = cartItem.getQuantity() + requestedQty;
            if (newQty > variant.getStockQuantity()) {
                throw new RuntimeException("Tổng số lượng trong giỏ hàng vượt quá số lượng tồn kho khả dụng (" + variant.getStockQuantity() + ")!");
            }
            cartItem.setQuantity(newQty);
        } else {
            if (requestedQty > variant.getStockQuantity()) {
                throw new RuntimeException("Số lượng yêu cầu vượt quá số lượng tồn kho khả dụng (" + variant.getStockQuantity() + ")!");
            }
            cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setVariant(variant);
            cartItem.setQuantity(requestedQty);
        }

        cartItemRepository.save(cartItem);
        return getCart(username);
    }

    @Transactional
    public CartResponse updateCartItemQuantity(String username, CartItemRequest request) {
        User user = findUser(username);
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Biến thể sản phẩm không tồn tại!"));

        int newQty = request.getQuantity() != null ? request.getQuantity() : 1;
        if (newQty <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0!");
        }

        if (newQty > variant.getStockQuantity()) {
            throw new RuntimeException("Số lượng yêu cầu vượt quá số lượng tồn kho khả dụng (" + variant.getStockQuantity() + ")!");
        }

        CartItem cartItem = cartItemRepository.findByUserIdAndVariantId(user.getId(), variant.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng của bạn!"));

        cartItem.setQuantity(newQty);
        cartItemRepository.save(cartItem);

        return getCart(username);
    }

    @Transactional
    public CartResponse removeCartItem(String username, Long variantId) {
        User user = findUser(username);
        CartItem cartItem = cartItemRepository.findByUserIdAndVariantId(user.getId(), variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không có trong giỏ hàng của bạn!"));

        cartItemRepository.delete(cartItem);
        return getCart(username);
    }

    @Transactional
    public void clearCart(String username) {
        User user = findUser(username);
        cartItemRepository.deleteByUserId(user.getId());
    }

    @Transactional
    public void deleteCartItems(String username, List<Long> variantIds) {
        User user = findUser(username);
        for (Long variantId : variantIds) {
            cartItemRepository.deleteByUserIdAndVariantId(user.getId(), variantId);
        }
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại!"));
    }
}

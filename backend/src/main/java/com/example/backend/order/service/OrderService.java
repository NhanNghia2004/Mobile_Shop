package com.example.backend.order.service;

import com.example.backend.admin.inventory.entity.StockChangeType;
import com.example.backend.admin.inventory.entity.StockHistory;
import com.example.backend.admin.inventory.repository.StockHistoryRepository;
import com.example.backend.cart.dto.CartResponse;
import com.example.backend.cart.service.CartService;
import com.example.backend.exception.ForbiddenException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.order.dto.OrderRequest;
import com.example.backend.order.dto.OrderResponse;
import com.example.backend.order.entity.Order;
import com.example.backend.order.entity.OrderItem;
import com.example.backend.order.entity.OrderStatus;
import com.example.backend.order.repository.OrderRepository;
import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.repository.ProductVariantRepository;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository          orderRepository;
    private final UserRepository           userRepository;
    private final CartService              cartService;
    private final ProductVariantRepository variantRepository;
    private final StockHistoryRepository   stockHistoryRepository;

    @Transactional
    public OrderResponse checkout(String username, OrderRequest request) {
        User user = findUser(username);
        CartResponse cart = cartService.getCart(username);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng đang trống!");
        }

        Order order = new Order();
        order.setUser(user);
        order.setRecipientName(request.getRecipientName());
        order.setPhone(request.getPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD");
        order.setTotalAmount(cart.getTotalAmount());

        List<StockHistory> pendingHistories = new ArrayList<>();

        for (var cartItem : cart.getItems()) {
            ProductVariant variant = variantRepository.findByIdForUpdate(cartItem.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại!"));

            if (variant.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + variant.getProduct().getName()
                        + " không đủ số lượng tồn kho!");
            }

            int stockBefore = variant.getStockQuantity();
            variant.setStockQuantity(stockBefore - cartItem.getQuantity());

            com.example.backend.product.entity.Product product = variant.getProduct();
            product.setSoldCount(product.getSoldCount() + cartItem.getQuantity());

            variantRepository.save(variant);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setVariant(variant);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());
            order.getOrderItems().add(orderItem);

            // Tạm giữ history chưa có orderId — chưa save vào DB
            StockHistory history = new StockHistory(
                    variant,
                    StockChangeType.ORDER_DEDUCT,
                    -cartItem.getQuantity(),
                    stockBefore,
                    variant.getStockQuantity(),
                    username,
                    null
            );
            pendingHistories.add(history);
        }

        Order savedOrder = orderRepository.save(order);


        String orderNote = "Đơn hàng #" + savedOrder.getId();
        pendingHistories.forEach(h -> h.setNote(orderNote));
        stockHistoryRepository.saveAll(pendingHistories);

        cartService.clearCart(username);
        return OrderResponse.from(savedOrder);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getUserOrders(String username, int page, int size) {
        User user = findUser(username);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findByUserId(user.getId(), pageable);
        return PageResponse.from(orders, OrderResponse::from);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(String username, Long orderId) {
        Order order = findOrder(orderId);
        if (!order.getUser().getUsername().equals(username)) {
            throw new ForbiddenException("Bạn không có quyền xem đơn hàng này!");
        }
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse cancelOrder(String username, Long orderId) {
        Order order = findOrder(orderId);
        if (!order.getUser().getUsername().equals(username)) {
            throw new ForbiddenException("Bạn không có quyền hủy đơn hàng này!");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang ở trạng thái PENDING!");
        }
        order.setStatus(OrderStatus.CANCELLED);
        restoreStock(order);
        return OrderResponse.from(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrdersForAdmin(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findAll(pageable);
        return PageResponse.from(orders, OrderResponse::from);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = findOrder(orderId);
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Đơn hàng đã hủy không thể đổi trạng thái khác!");
        }
        if (newStatus == OrderStatus.CANCELLED) {
            restoreStock(order);
        }
        order.setStatus(newStatus);
        return OrderResponse.from(orderRepository.save(order));
    }

    // Helpers

    private void restoreStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            ProductVariant variant = variantRepository.findByIdForUpdate(item.getVariant().getId())
                    .orElse(null);
            if (variant != null) {
                int stockBefore = variant.getStockQuantity();
                variant.setStockQuantity(stockBefore + item.getQuantity());

                com.example.backend.product.entity.Product product = variant.getProduct();
                product.setSoldCount(Math.max(0, product.getSoldCount() - item.getQuantity()));

                variantRepository.save(variant);

                stockHistoryRepository.save(new StockHistory(
                        variant,
                        StockChangeType.ORDER_RESTORE,
                        item.getQuantity(),
                        stockBefore,
                        variant.getStockQuantity(),
                        "SYSTEM",
                        "Hoàn kho do hủy đơn #" + order.getId()
                ));
            }
        }
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại!"));
    }

    private Order findOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại!"));
    }
}
package com.example.backend.order.repository;

import com.example.backend.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = { "orderItems", "orderItems.variant", "orderItems.variant.product" })
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = { "orderItems", "orderItems.variant", "orderItems.variant.product", "user" })
    Page<Order> findAll(Pageable pageable);

    @EntityGraph(attributePaths = { "orderItems", "orderItems.variant", "orderItems.variant.product", "user" })
    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE (:userId IS NULL OR o.user.id = :userId) AND (:status IS NULL OR o.status = :status)")
    Page<Order> findAllWithFilter(@org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("status") com.example.backend.order.entity.OrderStatus status,
            Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o WHERE o.status = :status AND o.createdAt >= :startDate")
    java.util.List<Order> findByStatusAndCreatedAtAfter(
            @org.springframework.data.repository.query.Param("status") com.example.backend.order.entity.OrderStatus status, 
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
    Double sumTotalPriceByStatus(@org.springframework.data.repository.query.Param("status") com.example.backend.order.entity.OrderStatus status);

    java.util.List<Order> findByCreatedAtAfter(java.time.LocalDateTime startDate);
}

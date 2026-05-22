package com.example.backend.order.repository;

import com.example.backend.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"orderItems", "orderItems.variant", "orderItems.variant.product"})
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.variant", "orderItems.variant.product", "user"})
    Page<Order> findAll(Pageable pageable);
}

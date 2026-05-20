package com.example.backend.cart.repository;

import com.example.backend.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("SELECT ci FROM CartItem ci JOIN FETCH ci.variant v JOIN FETCH v.product p WHERE ci.user.id = :userId")
    List<CartItem> findByUserIdWithProductAndVariant(@Param("userId") Long userId);

    Optional<CartItem> findByUserIdAndVariantId(Long userId, Long variantId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByUserId(Long userId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByUserIdAndVariantId(Long userId, Long variantId);
}

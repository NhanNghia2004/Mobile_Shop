package com.example.backend.review.repository;

import com.example.backend.review.entity.Review;
import com.example.backend.review.entity.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Lấy danh sách review của 1 sản phẩm
    @Query("""
        SELECT DISTINCT r FROM Review r
        LEFT JOIN FETCH r.user
        LEFT JOIN FETCH r.variant
        LEFT JOIN FETCH r.images
        WHERE r.product.id = :productId
          AND r.status = :status
    """)
    Page<Review> findByProductIdAndStatus(
            @Param("productId") Long productId,
            @Param("status") ReviewStatus status,
            Pageable pageable
    );

    // Lọc theo số sao
    @Query("""
        SELECT DISTINCT r FROM Review r
        LEFT JOIN FETCH r.user
        LEFT JOIN FETCH r.variant
        LEFT JOIN FETCH r.images
        WHERE r.product.id = :productId
          AND r.status = :status
          AND r.rating = :rating
    """)
    Page<Review> findByProductIdAndStatusAndRating(
            @Param("productId") Long productId,
            @Param("status") ReviewStatus status,
            @Param("rating") Integer rating,
            Pageable pageable
    );

    // Tính rating trung bình
    @Query("""
        SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r
        WHERE r.product.id = :productId
          AND r.status = 'VISIBLE'
    """)
    Double avgRatingByProductId(@Param("productId") Long productId);

    // Đếm tổng số review visible
    long countByProductIdAndStatus(Long productId, ReviewStatus status);

    // Đếm theo từng mức sao
    @Query("""
        SELECT r.rating, COUNT(r) FROM Review r
        WHERE r.product.id = :productId
          AND r.status = 'VISIBLE'
        GROUP BY r.rating
    """)
    java.util.List<Object[]> countByRatingForProduct(@Param("productId") Long productId);

    // Kiểm tra user đã review variant này chưa
    boolean existsByUserIdAndVariantId(Long userId, Long variantId);

    // Lấy review của user cho variant
    Optional<Review> findByUserIdAndVariantId(Long userId, Long variantId);

    // Admin: lấy tất cả review (kể cả HIDDEN)
    @Query("""
        SELECT DISTINCT r FROM Review r
        LEFT JOIN FETCH r.user
        LEFT JOIN FETCH r.product
        LEFT JOIN FETCH r.variant
        LEFT JOIN FETCH r.images
        WHERE (:productId IS NULL OR r.product.id = :productId)
    """)
    Page<Review> findAllForAdmin(
            @Param("productId") Long productId,
            Pageable pageable
    );
}
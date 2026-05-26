package com.example.backend.review.repository;

import com.example.backend.review.entity.Review;
import com.example.backend.review.entity.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ── Public endpoints (giữ nguyên) ────────────────────────────────────────

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
            @Param("status")    ReviewStatus status,
            Pageable pageable
    );

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
            @Param("status")    ReviewStatus status,
            @Param("rating")    Integer rating,
            Pageable pageable
    );

    @Query("""
        SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r
        WHERE r.product.id = :productId
          AND r.status = com.example.backend.review.entity.ReviewStatus.VISIBLE
    """)
    Double avgRatingByProductId(@Param("productId") Long productId);

    long countByProductIdAndStatus(Long productId, ReviewStatus status);

    @Query("""
        SELECT r.rating, COUNT(r) FROM Review r
        WHERE r.product.id = :productId
          AND r.status = com.example.backend.review.entity.ReviewStatus.VISIBLE
        GROUP BY r.rating
    """)
    List<Object[]> countByRatingForProduct(@Param("productId") Long productId);

    boolean existsByUserIdAndVariantId(Long userId, Long variantId);

    Optional<Review> findByUserIdAndVariantId(Long userId, Long variantId);

    // Admin: filter nâng cao

    @Query(value = """
        SELECT DISTINCT r FROM Review r
        LEFT JOIN FETCH r.user   u
        LEFT JOIN FETCH r.product p
        LEFT JOIN FETCH r.variant v
        LEFT JOIN FETCH r.images
        WHERE (:productId IS NULL OR r.product.id = :productId)
          AND (:status    IS NULL OR r.status     = :status)
          AND (:rating    IS NULL OR r.rating     = :rating)
          AND (
              :keyword IS NULL
              OR LOWER(u.username)   LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(u.email)      LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(p.name)       LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
          AND (:hasImages IS NULL
               OR (:hasImages = true  AND SIZE(r.images) > 0)
               OR (:hasImages = false AND SIZE(r.images) = 0)
          )
          AND (:hasReply IS NULL
               OR (:hasReply = true  AND r.adminReply IS NOT NULL)
               OR (:hasReply = false AND r.adminReply IS NULL)
          )
    """,
            countQuery = """
        SELECT COUNT(DISTINCT r.id) FROM Review r
        LEFT JOIN r.user   u
        LEFT JOIN r.product p
        WHERE (:productId IS NULL OR r.product.id = :productId)
          AND (:status    IS NULL OR r.status     = :status)
          AND (:rating    IS NULL OR r.rating     = :rating)
          AND (
              :keyword IS NULL
              OR LOWER(u.username)   LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(u.email)      LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(p.name)       LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
          AND (:hasImages IS NULL
               OR (:hasImages = true  AND SIZE(r.images) > 0)
               OR (:hasImages = false AND SIZE(r.images) = 0)
          )
          AND (:hasReply IS NULL
               OR (:hasReply = true  AND r.adminReply IS NOT NULL)
               OR (:hasReply = false AND r.adminReply IS NULL)
          )
    """)
    Page<Review> filterForAdmin(
            @Param("productId")  Long productId,
            @Param("status")     ReviewStatus status,
            @Param("rating")     Integer rating,
            @Param("keyword")    String keyword,
            @Param("hasImages")  Boolean hasImages,
            @Param("hasReply")   Boolean hasReply,
            Pageable pageable
    );

    //Admin: thống kê

    long countByStatus(ReviewStatus status);

    @Query("SELECT COUNT(r) FROM Review r WHERE SIZE(r.images) > 0")
    long countReviewsWithImages();

    @Query("SELECT COUNT(r) FROM Review r WHERE r.adminReply IS NOT NULL")
    long countReviewsWithReply();

    @Query("""
        SELECT COUNT(r) FROM Review r
        WHERE r.status = com.example.backend.review.entity.ReviewStatus.VISIBLE
          AND r.adminReply IS NULL
    """)
    long countVisibleReviewsWithNoReply();

    @Query("""
        SELECT r.rating, COUNT(r) FROM Review r
        GROUP BY r.rating
    """)
    List<Object[]> countAllByRating();

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.status = com.example.backend.review.entity.ReviewStatus.VISIBLE")
    Double avgRatingAllProducts();
}
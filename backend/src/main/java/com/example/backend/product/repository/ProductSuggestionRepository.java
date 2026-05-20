package com.example.backend.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.product.entity.Product;

import java.util.List;

/**
 * Các query nhẹ chuyên phục vụ autocomplete — chỉ SELECT những cột cần thiết,
 * không JOIN FETCH variants để đảm bảo phản hồi nhanh (< 50ms).
 */
@Repository
public interface ProductSuggestionRepository extends JpaRepository<Product, Long> {

    /**
     * Gợi ý tên sản phẩm khớp prefix/substring.
     * Trả về [name, imageUrl, id] — đủ để render thumbnail + label.
     */
    @Query("""
        SELECT p.name, p.imageUrl, p.id
        FROM Product p
        WHERE p.status = com.example.backend.product.entity.ProductStatus.ACTIVE
          AND LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
        ORDER BY p.soldCount DESC
        LIMIT :limit
    """)
    List<Object[]> suggestByName(@Param("q") String q, @Param("limit") int limit);

    /**
     * Gợi ý thương hiệu + đếm số sản phẩm của brand đó.
     */
    @Query("""
        SELECT p.brand, COUNT(p)
        FROM Product p
        WHERE p.status = com.example.backend.product.entity.ProductStatus.ACTIVE
          AND LOWER(p.brand) LIKE LOWER(CONCAT('%', :q, '%'))
        GROUP BY p.brand
        ORDER BY COUNT(p) DESC
        LIMIT :limit
    """)
    List<Object[]> suggestByBrand(@Param("q") String q, @Param("limit") int limit);

    /**
     * Gợi ý dung lượng storage — tìm variant có storage LIKE prefix số.
     * VD: gõ "12" → gợi ý "128GB", "1256GB" (nếu có).
     */
    @Query("""
        SELECT DISTINCT v.storage, COUNT(DISTINCT v.product.id)
        FROM ProductVariant v
        WHERE v.product.status = com.example.backend.product.entity.ProductStatus.ACTIVE
          AND v.status = com.example.backend.product.entity.ProductStatus.ACTIVE
          AND CAST(v.storage AS string) LIKE CONCAT(:q, '%')
        GROUP BY v.storage
        ORDER BY v.storage ASC
        LIMIT :limit
    """)
    List<Object[]> suggestByStorage(@Param("q") String q, @Param("limit") int limit);

    /**
     * Gợi ý màu sắc — tìm variant có color LIKE prefix.
     */
    @Query("""
        SELECT DISTINCT v.color, COUNT(DISTINCT v.product.id)
        FROM ProductVariant v
        WHERE v.product.status = com.example.backend.product.entity.ProductStatus.ACTIVE
          AND v.status = com.example.backend.product.entity.ProductStatus.ACTIVE
          AND LOWER(v.color) LIKE LOWER(CONCAT(:q, '%'))
        GROUP BY v.color
        ORDER BY COUNT(DISTINCT v.product.id) DESC
        LIMIT :limit
    """)
    List<Object[]> suggestByColor(@Param("q") String q, @Param("limit") int limit);

    /**
     * Gợi ý RAM.
     */
    @Query("""
        SELECT DISTINCT p.ram, COUNT(p)
        FROM Product p
        WHERE p.status = com.example.backend.product.entity.ProductStatus.ACTIVE
          AND p.ram IS NOT NULL
          AND CAST(p.ram AS string) LIKE CONCAT(:q, '%')
        GROUP BY p.ram
        ORDER BY p.ram ASC
        LIMIT :limit
    """)
    List<Object[]> suggestByRam(@Param("q") String q, @Param("limit") int limit);
}
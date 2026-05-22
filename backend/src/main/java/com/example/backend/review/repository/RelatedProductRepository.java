package com.example.backend.review.repository;

import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelatedProductRepository extends JpaRepository<Product, Long> {

    // Cùng brand + category, loại trừ chính sản phẩm đó, fetch variants luôn
    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
        WHERE p.id <> :excludeId
          AND LOWER(p.brand) = LOWER(:brand)
          AND p.category = :category
          AND p.status = :status
        ORDER BY p.soldCount DESC
    """)
    List<Product> findRelatedBySameBrandAndCategory(
            @Param("excludeId")  Long productId,
            @Param("brand")      String brand,
            @Param("category")   com.example.backend.product.entity.ProductCategory category,
            @Param("status")     ProductStatus status,
            Pageable pageable
    );

    // Cùng brand, loại trừ danh sách id đã có
    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
        WHERE p.id NOT IN :excludeIds
          AND LOWER(p.brand) = LOWER(:brand)
          AND p.status = :status
        ORDER BY p.soldCount DESC
    """)
    List<Product> findRelatedBySameBrandExcluding(
            @Param("excludeIds") List<Long> excludeIds,
            @Param("brand")      String brand,
            @Param("status")     ProductStatus status,
            Pageable pageable
    );
}
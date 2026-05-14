package com.example.backend.product.repository;

import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    // ── FIX #5: Thêm JOIN FETCH variants để tránh N+1 query ──

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
        WHERE p.status = :status
    """)
    List<Product> findByStatusWithVariants(@Param("status") ProductStatus status);

    // Dùng cho admin (findAll vẫn cần fetch variants)
    @Query(value = """
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
    """,
            countQuery = "SELECT COUNT(p) FROM Product p")
    Page<Product> findAllWithVariants(Pageable pageable);

    // ── FIX #5: filterProducts với JOIN FETCH ──
    @Query(
            value = """
            SELECT DISTINCT p FROM Product p
            LEFT JOIN FETCH p.variants v
            WHERE p.status = 'ACTIVE'
              AND (:brand    IS NULL OR LOWER(p.brand)    = LOWER(:brand))
              AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
              AND (:os       IS NULL OR LOWER(p.os)       = LOWER(:os))
              AND (:keyword  IS NULL
                   OR LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:minPrice IS NULL OR v.price >= :minPrice)
              AND (:maxPrice IS NULL OR v.price <= :maxPrice)
        """,
            countQuery = """
            SELECT COUNT(DISTINCT p.id) FROM Product p
            LEFT JOIN p.variants v
            WHERE p.status = 'ACTIVE'
              AND (:brand    IS NULL OR LOWER(p.brand)    = LOWER(:brand))
              AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
              AND (:os       IS NULL OR LOWER(p.os)       = LOWER(:os))
              AND (:keyword  IS NULL
                   OR LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:minPrice IS NULL OR v.price >= :minPrice)
              AND (:maxPrice IS NULL OR v.price <= :maxPrice)
        """
    )
    Page<Product> filterProducts(
            @Param("brand")     String brand,
            @Param("category")  String category,
            @Param("os")        String os,
            @Param("minPrice")  Double minPrice,
            @Param("maxPrice")  Double maxPrice,
            @Param("keyword")   String keyword,
            Pageable pageable
    );

    // ── FIX #4: ORDER BY giá thấp nhất của từng sản phẩm → ổn định, không lặp ──
    @Query(
            value = """
            SELECT DISTINCT p FROM Product p
            JOIN p.variants v
            WHERE p.status = com.example.backend.product.entity.ProductStatus.ACTIVE
              AND v.status = com.example.backend.product.entity.ProductStatus.ACTIVE
              AND v.discountPrice IS NOT NULL
            ORDER BY (
                SELECT MIN(v2.discountPrice) FROM ProductVariant v2
                WHERE v2.product = p
                  AND v2.discountPrice IS NOT NULL
            ) ASC
        """,
            countQuery = """
            SELECT COUNT(DISTINCT p.id) FROM Product p
            JOIN p.variants v
            WHERE p.status = com.example.backend.product.entity.ProductStatus.ACTIVE
              AND v.status = com.example.backend.product.entity.ProductStatus.ACTIVE
              AND v.discountPrice IS NOT NULL
        """
    )
    Page<Product> findDiscountedProducts(Pageable pageable);

    // Bestsellers & new arrivals cũng fetch variants luôn
    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
        WHERE p.status = :status
        ORDER BY p.soldCount DESC
    """)
    List<Product> findTop10ByStatusOrderBySoldCountDescWithVariants(
            @Param("status") ProductStatus status,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
        WHERE p.status = :status
        ORDER BY p.createdAt DESC
    """)
    List<Product> findTop8ByStatusOrderByCreatedAtDescWithVariants(
            @Param("status") ProductStatus status,
            Pageable pageable
    );

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.brand")
    List<String> findAllBrands();

    boolean existsByNameIgnoreCase(String name);

    // Kiểm tra tên trùng khi update (loại trừ chính nó)
    @Query("""
        SELECT COUNT(p) > 0 FROM Product p
        WHERE LOWER(p.name) = LOWER(:name) AND p.id <> :excludeId
    """)
    boolean existsByNameIgnoreCaseAndIdNot(
            @Param("name") String name,
            @Param("excludeId") Long excludeId
    );

    Optional<Product> findById(Long id);
}
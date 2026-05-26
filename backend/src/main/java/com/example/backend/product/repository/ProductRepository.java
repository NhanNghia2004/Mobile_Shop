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

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
        WHERE p.status = :status
    """)
    List<Product> findByStatusWithVariants(@Param("status") ProductStatus status);

    @Query(value = """
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
    """,
            countQuery = "SELECT COUNT(p) FROM Product p")
    Page<Product> findAllWithVariants(Pageable pageable);

    @Query(
            value = """
            SELECT DISTINCT p FROM Product p
            LEFT JOIN FETCH p.variants
            WHERE p.status = :status
              AND (:brand    IS NULL OR LOWER(p.brand)    = LOWER(:brand))
              AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
              AND (:os       IS NULL OR LOWER(p.os)       = LOWER(:os))
              AND (:keyword  IS NULL
                   OR LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (
                    (:minPrice IS NULL AND :maxPrice IS NULL)
                    OR EXISTS (
                        SELECT 1 FROM ProductVariant v
                        WHERE v.product = p
                          AND v.status = :status
                          AND (:minPrice IS NULL OR COALESCE(v.discountPrice, v.price) >= :minPrice)
                          AND (:maxPrice IS NULL OR COALESCE(v.discountPrice, v.price) <= :maxPrice)
                    )
              )
        """,
            countQuery = """
            SELECT COUNT(DISTINCT p.id) FROM Product p
            WHERE p.status = :status
              AND (:brand    IS NULL OR LOWER(p.brand)    = LOWER(:brand))
              AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
              AND (:os       IS NULL OR LOWER(p.os)       = LOWER(:os))
              AND (:keyword  IS NULL
                   OR LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (
                    (:minPrice IS NULL AND :maxPrice IS NULL)
                    OR EXISTS (
                        SELECT 1 FROM ProductVariant v
                        WHERE v.product = p
                          AND v.status = :status
                          AND (:minPrice IS NULL OR COALESCE(v.discountPrice, v.price) >= :minPrice)
                          AND (:maxPrice IS NULL OR COALESCE(v.discountPrice, v.price) <= :maxPrice)
                    )
              )
        """
    )
    Page<Product> filterProducts(
            @Param("status")   ProductStatus status,
            @Param("brand")    String brand,
            @Param("category") String category,
            @Param("os")       String os,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("keyword")  String keyword,
            Pageable pageable
    );

    @Query(
            value = """
            SELECT DISTINCT p FROM Product p
            LEFT JOIN FETCH p.variants
            WHERE p.status = :status
              AND EXISTS (
                  SELECT 1 FROM ProductVariant v
                  WHERE v.product = p
                    AND v.status = :status
                    AND v.discountPrice IS NOT NULL
              )
            ORDER BY (
                SELECT MIN(v2.discountPrice) FROM ProductVariant v2
                WHERE v2.product = p AND v2.discountPrice IS NOT NULL
            ) ASC
        """,
            countQuery = """
            SELECT COUNT(DISTINCT p.id) FROM Product p
            JOIN p.variants v
            WHERE p.status = :status
              AND v.status = :status
              AND v.discountPrice IS NOT NULL
        """
    )
    Page<Product> findDiscountedProducts(@Param("status") ProductStatus status, Pageable pageable);

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
        WHERE p.id = :id
    """)
    Optional<Product> findByIdWithVariants(@Param("id") Long id);

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


    @Query("""
        SELECT
            MIN(COALESCE(v.discountPrice, v.price)),
            MAX(COALESCE(v.discountPrice, v.price))
        FROM ProductVariant v
        WHERE v.product.status = :status
          AND v.status = :status
    """)
    Object[] findPriceRange(@Param("status") ProductStatus status);

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.status = :status ORDER BY p.brand")
    List<String> findAllBrands(@Param("status") ProductStatus status);

    boolean existsByNameIgnoreCase(String name);

    @Query("""
        SELECT COUNT(p) > 0 FROM Product p
        WHERE LOWER(p.name) = LOWER(:name) AND p.id <> :excludeId
    """)
    boolean existsByNameIgnoreCaseAndIdNot(
            @Param("name")      String name,
            @Param("excludeId") Long excludeId
    );

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

// ══════════════════════════════════════════════════════════════════════
// Admin product
// ══════════════════════════════════════════════════════════════════════
//1. Filter nâng cao dành cho admin

    @Query(value = """
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
        WHERE (:status   IS NULL OR p.status   = :status)
          AND (:brand    IS NULL OR LOWER(p.brand)    = LOWER(:brand))
          AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
          AND (:os       IS NULL OR LOWER(p.os)       = LOWER(:os))
          AND (:keyword  IS NULL
               OR LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """,
            countQuery = """
        SELECT COUNT(DISTINCT p.id) FROM Product p
        WHERE (:status   IS NULL OR p.status   = :status)
          AND (:brand    IS NULL OR LOWER(p.brand)    = LOWER(:brand))
          AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
          AND (:os       IS NULL OR LOWER(p.os)       = LOWER(:os))
          AND (:keyword  IS NULL
               OR LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<Product> filterProductsForAdmin(
            @Param("status")   ProductStatus status,
            @Param("brand")    String brand,
            @Param("category") String category,
            @Param("os")       String os,
            @Param("keyword")  String keyword,
            Pageable pageable
    );

    // 2. Đếm theo từng status

    long countByStatus(ProductStatus status);

    // 3. Đếm sản phẩm hoàn toàn hết hàng

    @Query("""
        SELECT COUNT(DISTINCT p.id) FROM Product p
        JOIN p.variants v
        WHERE p.status = com.example.backend.product.entity.ProductStatus.ACTIVE
        GROUP BY p.id
        HAVING SUM(v.stockQuantity) = 0
    """)
    long countCompletelyOutOfStock();

    // 4. Tổng soldCount toàn hệ thống

    @Query("SELECT COALESCE(SUM(p.soldCount), 0) FROM Product p")
    long sumTotalSoldCount();

    // 5. Tổng số variant

    @Query("SELECT COUNT(v.id) FROM ProductVariant v")
    long countTotalVariants();

// ══════════════════════════════════════════════════════════════════════
// Admin tồn kho
// ══════════════════════════════════════════════════════════════════════

    // 1. Query tồn kho với filter đầy đủ (dùng cho trang quản lý tồn kho)
    @Query(value = """
    SELECT DISTINCT p FROM Product p
    LEFT JOIN FETCH p.variants v
    WHERE p.status <> com.example.backend.product.entity.ProductStatus.INACTIVE
      AND (:brand    IS NULL OR LOWER(p.brand)    = LOWER(:brand))
      AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
      AND (:keyword  IS NULL
           OR LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
""",
            countQuery = """
    SELECT COUNT(DISTINCT p.id) FROM Product p
    WHERE p.status <> com.example.backend.product.entity.ProductStatus.INACTIVE
      AND (:brand    IS NULL OR LOWER(p.brand)    = LOWER(:brand))
      AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
      AND (:keyword  IS NULL
           OR LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
""")
    Page<Product> findForInventory(
            @Param("keyword")  String keyword,
            @Param("brand")    String brand,
            @Param("category") String category,
            Pageable pageable
    );

    // 2. Thống kê nhanh cho dashboard tồn kho
    @Query("""
    SELECT COUNT(DISTINCT p.id)
    FROM Product p
    WHERE p.status = com.example.backend.product.entity.ProductStatus.ACTIVE
""")
    long countActiveProducts();

    @Query("""
    SELECT COUNT(v.id)
    FROM ProductVariant v
    WHERE v.product.status = com.example.backend.product.entity.ProductStatus.ACTIVE
""")
    long countAllVariants();

    @Query("""
    SELECT COUNT(v.id)
    FROM ProductVariant v
    WHERE v.product.status = com.example.backend.product.entity.ProductStatus.ACTIVE
      AND v.stockQuantity = 0
""")
    long countOutOfStockVariants();

    @Query("""
    SELECT COALESCE(SUM(v.stockQuantity), 0)
    FROM ProductVariant v
    WHERE v.product.status = com.example.backend.product.entity.ProductStatus.ACTIVE
""")
    long sumTotalStockUnits();
}
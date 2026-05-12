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

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {


    Page<Product> findByStatus(ProductStatus status, Pageable pageable);


    Page<Product> findByBrandIgnoreCaseAndStatus(String brand, ProductStatus status, Pageable pageable);


    Page<Product> findByCategoryIgnoreCaseAndStatus(String category, ProductStatus status, Pageable pageable);


    @Query("""
        SELECT p FROM Product p
        WHERE p.status = :status
          AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<Product> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("status") ProductStatus status,
            Pageable pageable
    );

    // Lọc nâng cao: brand + category + khoảng giá + os
    @Query("""
    SELECT DISTINCT p FROM Product p
    LEFT JOIN p.variants v
    WHERE p.status = 'ACTIVE'
      AND (:brand IS NULL OR LOWER(p.brand) = LOWER(:brand))
      AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
      AND (:os IS NULL OR LOWER(p.os) = LOWER(:os))
      AND (:keyword IS NULL 
           OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:minPrice IS NULL OR v.price >= :minPrice)
      AND (:maxPrice IS NULL OR v.price <= :maxPrice)
""")
    Page<Product> filterProducts(
            @Param("brand") String brand,
            @Param("category") String category,
            @Param("os") String os,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("keyword") String keyword,
            Pageable pageable
    );


    List<Product> findTop10ByStatusOrderBySoldCountDesc(ProductStatus status);


    List<Product> findTop8ByStatusOrderByCreatedAtDesc(ProductStatus status);


    @Query("""
    SELECT DISTINCT p FROM Product p 
    JOIN p.variants v 
    WHERE p.status = com.example.backend.product.entity.ProductStatus.ACTIVE 
      AND v.status = com.example.backend.product.entity.ProductStatus.ACTIVE
      AND v.discountPrice IS NOT NULL 
    ORDER BY v.discountPrice ASC
""")
    Page<Product> findDiscountedProducts(Pageable pageable);


    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.brand")
    List<String> findAllBrands();


    boolean existsByNameIgnoreCase(String name);
}
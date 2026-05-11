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

    // Lấy sản phẩm đang bán (phân trang)
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    // Tìm theo brand
    Page<Product> findByBrandIgnoreCaseAndStatus(String brand, ProductStatus status, Pageable pageable);

    // Tìm theo category
    Page<Product> findByCategoryIgnoreCaseAndStatus(String category, ProductStatus status, Pageable pageable);

    // Tìm kiếm theo tên hoặc brand
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
        SELECT p FROM Product p
        WHERE p.status = 'ACTIVE'
          AND (:brand IS NULL OR LOWER(p.brand) = LOWER(:brand))
          AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
          AND (:os IS NULL OR LOWER(p.os) = LOWER(:os))
          AND (:minPrice IS NULL OR COALESCE(p.discountPrice, p.price) >= :minPrice)
          AND (:maxPrice IS NULL OR COALESCE(p.discountPrice, p.price) <= :maxPrice)
          AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')))
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

    // Top bán chạy nhất
    List<Product> findTop10ByStatusOrderBySoldCountDesc(ProductStatus status);

    // Sản phẩm mới nhất
    List<Product> findTop8ByStatusOrderByCreatedAtDesc(ProductStatus status);

    // Sản phẩm đang giảm giá (discountPrice != null)
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.discountPrice IS NOT NULL ORDER BY p.discountPrice ASC")
    Page<Product> findDiscountedProducts(Pageable pageable);

    // Danh sách brand duy nhất
    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.brand")
    List<String> findAllBrands();

    // Kiểm tra tên sản phẩm đã tồn tại chưa (cho admin)
    boolean existsByNameIgnoreCase(String name);
}
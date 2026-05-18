package com.example.backend.product.repository;

import com.example.backend.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductSearchRepository extends JpaRepository<Product, Long> {

    @Query(value = """
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants
        WHERE p.status = 'ACTIVE'
          AND (:os          IS NULL OR LOWER(p.os)  = LOWER(:os))
          AND (:ramGb        IS NULL OR p.ram        = :ramGb)
          AND (:textToken1  IS NULL
               OR LOWER(p.name)        LIKE LOWER(CONCAT('%', :textToken1, '%'))
               OR LOWER(p.brand)       LIKE LOWER(CONCAT('%', :textToken1, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :textToken1, '%')))
          AND (:textToken2  IS NULL
               OR LOWER(p.name)        LIKE LOWER(CONCAT('%', :textToken2, '%'))
               OR LOWER(p.brand)       LIKE LOWER(CONCAT('%', :textToken2, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :textToken2, '%')))
          AND (:textToken3  IS NULL
               OR LOWER(p.name)        LIKE LOWER(CONCAT('%', :textToken3, '%'))
               OR LOWER(p.brand)       LIKE LOWER(CONCAT('%', :textToken3, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :textToken3, '%')))
          AND (
               :storageGb IS NULL
               OR EXISTS (
                   SELECT 1 FROM ProductVariant v
                   WHERE v.product = p
                     AND v.status  = 'ACTIVE'
                     AND v.storage = :storageGb
               )
          )
          AND (
               :color IS NULL
               OR EXISTS (
                   SELECT 1 FROM ProductVariant v
                   WHERE v.product = p
                     AND v.status  = 'ACTIVE'
                     AND LOWER(v.color) LIKE LOWER(CONCAT('%', :color, '%'))
               )
          )
          AND (
               (:minPrice IS NULL AND :maxPrice IS NULL)
               OR EXISTS (
                   SELECT 1 FROM ProductVariant v2
                   WHERE v2.product = p
                     AND v2.status = 'ACTIVE'
                     AND (:minPrice IS NULL OR COALESCE(v2.discountPrice, v2.price) >= :minPrice)
                     AND (:maxPrice IS NULL OR COALESCE(v2.discountPrice, v2.price) <= :maxPrice)
               )
          )
    """,
            countQuery = """
        SELECT COUNT(DISTINCT p.id) FROM Product p
        WHERE p.status = 'ACTIVE'
          AND (:os          IS NULL OR LOWER(p.os)  = LOWER(:os))
          AND (:ramGb        IS NULL OR p.ram        = :ramGb)
          AND (:textToken1  IS NULL
               OR LOWER(p.name)        LIKE LOWER(CONCAT('%', :textToken1, '%'))
               OR LOWER(p.brand)       LIKE LOWER(CONCAT('%', :textToken1, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :textToken1, '%')))
          AND (:textToken2  IS NULL
               OR LOWER(p.name)        LIKE LOWER(CONCAT('%', :textToken2, '%'))
               OR LOWER(p.brand)       LIKE LOWER(CONCAT('%', :textToken2, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :textToken2, '%')))
          AND (:textToken3  IS NULL
               OR LOWER(p.name)        LIKE LOWER(CONCAT('%', :textToken3, '%'))
               OR LOWER(p.brand)       LIKE LOWER(CONCAT('%', :textToken3, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :textToken3, '%')))
          AND (
               :storageGb IS NULL
               OR EXISTS (
                   SELECT 1 FROM ProductVariant v
                   WHERE v.product = p AND v.status = 'ACTIVE' AND v.storage = :storageGb
               )
          )
          AND (
               :color IS NULL
               OR EXISTS (
                   SELECT 1 FROM ProductVariant v
                   WHERE v.product = p AND v.status = 'ACTIVE'
                     AND LOWER(v.color) LIKE LOWER(CONCAT('%', :color, '%'))
               )
          )
          AND (
               (:minPrice IS NULL AND :maxPrice IS NULL)
               OR EXISTS (
                   SELECT 1 FROM ProductVariant v2
                   WHERE v2.product = p
                     AND v2.status = 'ACTIVE'
                     AND (:minPrice IS NULL OR COALESCE(v2.discountPrice, v2.price) >= :minPrice)
                     AND (:maxPrice IS NULL OR COALESCE(v2.discountPrice, v2.price) <= :maxPrice)
               )
          )
    """)
    Page<Product> smartSearch(
            @Param("os")          String os,
            @Param("ramGb")       Integer ramGb,
            @Param("storageGb")   Integer storageGb,
            @Param("color")       String color,
            @Param("minPrice")    Double minPrice,
            @Param("maxPrice")    Double maxPrice,
            @Param("textToken1")  String textToken1,
            @Param("textToken2")  String textToken2,
            @Param("textToken3")  String textToken3,
            Pageable pageable
    );
}
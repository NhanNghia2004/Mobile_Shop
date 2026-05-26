package com.example.backend.admin.inventory.repository;

import com.example.backend.admin.inventory.entity.StockHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {

    // Lịch sử theo variant
    @Query("""
        SELECT sh FROM StockHistory sh
        JOIN FETCH sh.variant v
        JOIN FETCH v.product p
        WHERE sh.variant.id = :variantId
        ORDER BY sh.createdAt DESC
    """)
    Page<StockHistory> findByVariantId(
            @Param("variantId") Long variantId,
            Pageable pageable
    );

    // Lịch sử theo product (tất cả variant)
    @Query("""
        SELECT sh FROM StockHistory sh
        JOIN FETCH sh.variant v
        JOIN FETCH v.product p
        WHERE v.product.id = :productId
        ORDER BY sh.createdAt DESC
    """)
    Page<StockHistory> findByProductId(
            @Param("productId") Long productId,
            Pageable pageable
    );

    // Toàn bộ lịch sử + tìm kiếm theo tên sản phẩm
    @Query("""
        SELECT sh FROM StockHistory sh
        JOIN FETCH sh.variant v
        JOIN FETCH v.product p
        WHERE (
            :keyword IS NULL
            OR LOWER(p.name)  LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND (:changeType IS NULL OR sh.changeType = :changeType)
        ORDER BY sh.createdAt DESC
    """)
    Page<StockHistory> findAllWithFilter(
            @Param("keyword")    String keyword,
            @Param("changeType") com.example.backend.admin.inventory.entity.StockChangeType changeType,
            Pageable pageable
    );
}
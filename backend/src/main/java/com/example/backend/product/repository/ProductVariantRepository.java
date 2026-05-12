package com.example.backend.product.repository;

import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductId(Long productId);

    List<ProductVariant> findByProductIdAndStatus(Long productId, ProductStatus status);


    Optional<ProductVariant> findByProductIdAndStorageAndColorIgnoreCase(
            Long productId, Integer storage, String color);

    // Tổng tồn kho của 1 sản phẩm
    @Query("SELECT COALESCE(SUM(v.stockQuantity), 0) FROM ProductVariant v WHERE v.product.id = :productId")
    Integer sumStockByProductId(@Param("productId") Long productId);

    // Cập nhật trạng thái khi hết hàng
    @Modifying
    @Query("UPDATE ProductVariant v SET v.status = 'OUT_OF_STOCK' WHERE v.stockQuantity = 0 AND v.status = 'ACTIVE'")
    int markOutOfStockVariants();
}
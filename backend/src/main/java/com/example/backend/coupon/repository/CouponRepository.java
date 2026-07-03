package com.example.backend.coupon.repository;

import com.example.backend.coupon.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    @Query("SELECT c FROM Coupon c WHERE " +
           "(:keyword IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:isActive IS NULL OR c.isActive = :isActive)")
    Page<Coupon> filterAdminCoupons(@Param("keyword") String keyword, 
                                    @Param("isActive") Boolean isActive, 
                                    Pageable pageable);

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true AND " +
           "(c.endDate IS NULL OR c.endDate > CURRENT_TIMESTAMP) AND " +
           "(c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    java.util.List<Coupon> findActiveAndValidCoupons();
}

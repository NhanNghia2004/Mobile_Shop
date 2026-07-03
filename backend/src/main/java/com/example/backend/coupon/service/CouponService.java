package com.example.backend.coupon.service;

import com.example.backend.coupon.dto.CouponRequest;
import com.example.backend.coupon.dto.CouponResponse;
import com.example.backend.coupon.entity.Coupon;
import com.example.backend.coupon.repository.CouponRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.product.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    // ----- ADMIN METHODS -----

    public PageResponse<CouponResponse> filterAdminCoupons(String keyword, Boolean isActive, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Coupon> couponPage = couponRepository.filterAdminCoupons(keyword, isActive, pageable);
        return PageResponse.from(couponPage, CouponResponse::from);
    }

    public CouponResponse getCouponById(Long id) {
        return CouponResponse.from(findCouponOrThrow(id));
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Mã giảm giá đã tồn tại!");
        }

        Coupon coupon = new Coupon();
        mapRequestToEntity(request, coupon);
        return CouponResponse.from(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = findCouponOrThrow(id);

        if (!coupon.getCode().equals(request.getCode()) && couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Mã giảm giá đã tồn tại!");
        }

        mapRequestToEntity(request, coupon);
        return CouponResponse.from(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.delete(findCouponOrThrow(id));
    }

    @Transactional
    public CouponResponse toggleStatus(Long id) {
        Coupon coupon = findCouponOrThrow(id);
        coupon.setIsActive(!coupon.getIsActive());
        return CouponResponse.from(couponRepository.save(coupon));
    }

    // ----- USER / PUBLIC METHODS -----

    public CouponResponse validateCoupon(String code, Double cartTotal) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại!"));

        if (!coupon.getIsActive()) {
            throw new RuntimeException("Mã giảm giá đã bị vô hiệu hóa!");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new RuntimeException("Mã giảm giá chưa đến ngày sử dụng!");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn!");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng!");
        }

        if (coupon.getMinOrderValue() != null && cartTotal < coupon.getMinOrderValue()) {
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu " + coupon.getMinOrderValue() + "đ để sử dụng mã này!");
        }

        return CouponResponse.from(coupon);
    }

    public java.util.List<CouponResponse> getActiveCoupons() {
        return couponRepository.findActiveAndValidCoupons().stream()
                .map(CouponResponse::from)
                .collect(java.util.stream.Collectors.toList());
    }

    public Double calculateDiscount(Coupon coupon, Double cartTotal) {
        double discount = 0.0;
        if (coupon.getDiscountType() == Coupon.DiscountType.FIXED) {
            discount = coupon.getDiscountValue();
        } else if (coupon.getDiscountType() == Coupon.DiscountType.PERCENT) {
            discount = cartTotal * (coupon.getDiscountValue() / 100.0);
        }

        if (coupon.getMaxDiscountAmount() != null && discount > coupon.getMaxDiscountAmount()) {
            discount = coupon.getMaxDiscountAmount();
        }

        return discount;
    }

    @Transactional
    public void incrementUsedCount(String code) {
        Coupon coupon = couponRepository.findByCode(code).orElse(null);
        if (coupon != null) {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }
    }

    // ----- HELPER -----

    public Coupon getCouponEntity(Long id) {
        return findCouponOrThrow(id);
    }

    private Coupon findCouponOrThrow(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá id: " + id));
    }

    private void mapRequestToEntity(CouponRequest request, Coupon coupon) {
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderValue(request.getMinOrderValue());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) {
            coupon.setIsActive(request.getIsActive());
        }
    }
}

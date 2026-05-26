package com.example.backend.admin.inventory.service;

import com.example.backend.admin.inventory.dto.*;
import com.example.backend.admin.inventory.entity.StockChangeType;
import com.example.backend.admin.inventory.entity.StockHistory;
import com.example.backend.admin.inventory.repository.StockHistoryRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductCategory;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository        productRepository;
    private final ProductVariantRepository variantRepository;
    private final StockHistoryRepository   historyRepository;

    //1. Thống kê tổng quan

    @Transactional(readOnly = true)
    public InventoryStatsResponse getStats(int lowStockThreshold) {
        long totalProducts      = productRepository.countActiveProducts();
        long totalVariants      = productRepository.countAllVariants();
        long outOfStockVariants = productRepository.countOutOfStockVariants();
        long totalStockUnits    = productRepository.sumTotalStockUnits();

        // Đếm sản phẩm sắp hết: tổng tồn kho của product <= ngưỡng
        long lowStockProducts = productRepository
                .findByStatusWithVariants(ProductStatus.ACTIVE)
                .stream()
                .filter(p -> p.getTotalStock() > 0 && p.getTotalStock() <= lowStockThreshold)
                .count();

        return new InventoryStatsResponse(
                totalProducts, totalVariants,
                outOfStockVariants, lowStockProducts, totalStockUnits
        );
    }

    // 2. Danh sách tồn kho (có filter + phân trang)

    @Transactional(readOnly = true)
    public PageResponse<ProductStockResponse> getInventory(InventoryFilterRequest filter) {
        Pageable pageable = buildPageable(filter);

        Page<Product> page = productRepository.findForInventory(
                nullIfBlank(filter.getKeyword()),
                nullIfBlank(filter.getBrand()),
                nullIfBlank(filter.getCategory()),
                pageable
        );

        int threshold = filter.getLowStockThreshold();

        // Lọc theo stockStatus sau khi lấy từ DB
        List<ProductStockResponse> content = page.getContent().stream()
                .map(p -> ProductStockResponse.from(p, threshold))
                .filter(dto -> switch (filter.getStockStatus()) {
                    case "out"       -> dto.getTotalStock() == 0;
                    case "low"       -> dto.getTotalStock() > 0 && dto.getTotalStock() <= threshold;
                    case "available" -> dto.getTotalStock() > threshold;
                    default          -> true;
                })
                .collect(Collectors.toList());

        PageResponse<ProductStockResponse> response = new PageResponse<>();
        response.setContent(content);
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        return response;
    }

    //  3. Chi tiết tồn kho 1 sản phẩm

    @Transactional(readOnly = true)
    public ProductStockResponse getProductStock(Long productId, int lowStockThreshold) {
        Product product = productRepository.findByIdWithVariants(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy sản phẩm id: " + productId));
        return ProductStockResponse.from(product, lowStockThreshold);
    }

    //  4. Nhập kho 1 variant

    @Transactional
    public StockHistoryResponse importStock(StockImportRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("Số lượng nhập phải lớn hơn 0!");
        }

        ProductVariant variant = findVariantForUpdate(request.getVariantId());
        String adminName = getCurrentAdminName();

        int before = variant.getStockQuantity();
        int after  = before + request.getQuantity();

        variant.setStockQuantity(after);
        autoUpdateVariantStatus(variant);
        variantRepository.save(variant);

        StockHistory history = new StockHistory(
                variant, StockChangeType.IMPORT,
                request.getQuantity(), before, after,
                adminName,
                request.getNote() != null ? request.getNote() : "Nhập kho"
        );
        historyRepository.save(history);

        log.info("[Inventory] Nhập kho variantId={} +{} ({} → {}) by {}",
                variant.getId(), request.getQuantity(), before, after, adminName);

        return StockHistoryResponse.from(history);
    }

    //  5. Nhập kho hàng loạt

    @Transactional
    public List<StockHistoryResponse> bulkImportStock(StockBulkImportRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Danh sách nhập kho không được để trống!");
        }

        String adminName  = getCurrentAdminName();
        String commonNote = request.getNote();

        return request.getItems().stream().map(item -> {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException(
                        "Số lượng nhập cho variantId=" + item.getVariantId() + " phải > 0!");
            }

            ProductVariant variant = findVariantForUpdate(item.getVariantId());
            int before = variant.getStockQuantity();
            int after  = before + item.getQuantity();

            variant.setStockQuantity(after);
            autoUpdateVariantStatus(variant);
            variantRepository.save(variant);

            String note = item.getNote() != null ? item.getNote()
                    : (commonNote != null ? commonNote : "Nhập kho hàng loạt");

            StockHistory history = new StockHistory(
                    variant, StockChangeType.IMPORT,
                    item.getQuantity(), before, after, adminName, note
            );
            return StockHistoryResponse.from(historyRepository.save(history));
        }).collect(Collectors.toList());
    }

    //  6. Điều chỉnh tồn kho (set về con số cụ thể)

    @Transactional
    public StockHistoryResponse adjustStock(Long variantId, StockAdjustRequest request) {
        if (request.getNewQuantity() == null || request.getNewQuantity() < 0) {
            throw new RuntimeException("Số lượng tồn kho không được âm!");
        }

        ProductVariant variant = findVariantForUpdate(variantId);
        String adminName = getCurrentAdminName();

        int before = variant.getStockQuantity();
        int after  = request.getNewQuantity();

        if (before == after) {
            throw new RuntimeException("Số lượng mới bằng với số lượng hiện tại (" + before + ")!");
        }

        variant.setStockQuantity(after);
        autoUpdateVariantStatus(variant);
        variantRepository.save(variant);

        int changed = after - before; // âm = giảm, dương = tăng
        String note = request.getNote() != null
                ? request.getNote()
                : "Điều chỉnh tồn kho: " + before + " → " + after;

        StockHistory history = new StockHistory(
                variant, StockChangeType.ADJUSTMENT,
                changed, before, after, adminName, note
        );
        historyRepository.save(history);

        log.info("[Inventory] Điều chỉnh kho variantId={} {} → {} by {}",
                variantId, before, after, adminName);

        return StockHistoryResponse.from(history);
    }

    //7. Lịch sử tồn kho theo variant

    @Transactional(readOnly = true)
    public PageResponse<StockHistoryResponse> getHistoryByVariant(
            Long variantId, int page, int size) {
        // Kiểm tra variant tồn tại
        if (!variantRepository.existsById(variantId)) {
            throw new ResourceNotFoundException("Không tìm thấy variant id: " + variantId);
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<StockHistory> result = historyRepository.findByVariantId(variantId, pageable);
        return PageResponse.from(result, StockHistoryResponse::from);
    }

    // 8. Lịch sử tồn kho theo product
    @Transactional(readOnly = true)
    public PageResponse<StockHistoryResponse> getHistoryByProduct(
            Long productId, int page, int size) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + productId);
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<StockHistory> result = historyRepository.findByProductId(productId, pageable);
        return PageResponse.from(result, StockHistoryResponse::from);
    }

    // 9. Toàn bộ lịch sử + tìm kiếm

    @Transactional(readOnly = true)
    public PageResponse<StockHistoryResponse> getAllHistory(
            String keyword, String changeTypeStr, int page, int size) {

        StockChangeType changeType = null;
        if (changeTypeStr != null && !changeTypeStr.isBlank()) {
            try {
                changeType = StockChangeType.valueOf(changeTypeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Loại thay đổi không hợp lệ: " + changeTypeStr);
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<StockHistory> result = historyRepository.findAllWithFilter(
                nullIfBlank(keyword), changeType, pageable);
        return PageResponse.from(result, StockHistoryResponse::from);
    }

    // 10. Danh sách sản phẩm hết / sắp hết hàng (cảnh báo)

    @Transactional(readOnly = true)
    public List<ProductStockResponse> getLowStockProducts(int threshold) {
        return productRepository
                .findByStatusWithVariants(ProductStatus.ACTIVE)
                .stream()
                .filter(p -> p.getTotalStock() <= threshold)
                .map(p -> ProductStockResponse.from(p, threshold))
                .sorted(java.util.Comparator.comparingInt(ProductStockResponse::getTotalStock))
                .collect(Collectors.toList());
    }

    //Helpers


    private void autoUpdateVariantStatus(ProductVariant variant) {
        if (variant.getStockQuantity() == 0
                && variant.getStatus() == ProductStatus.ACTIVE) {
            variant.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (variant.getStockQuantity() > 0
                && variant.getStatus() == ProductStatus.OUT_OF_STOCK) {
            variant.setStatus(ProductStatus.ACTIVE);
        }
    }

    private ProductVariant findVariantForUpdate(Long variantId) {
        return variantRepository.findByIdForUpdate(variantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy variant id: " + variantId));
    }

    private String getCurrentAdminName() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Pageable buildPageable(InventoryFilterRequest filter) {
        Sort sort = switch (filter.getSortBy() != null ? filter.getSortBy() : "stock_asc") {
            case "stock_desc" -> Sort.by("name").ascending(); // sắp xếp sau khi map
            case "name_asc"   -> Sort.by("name").ascending();
            case "name_desc"  -> Sort.by("name").descending();
            case "newest"     -> Sort.by("createdAt").descending();
            default           -> Sort.by("name").ascending(); // stock_asc xử lý sau map
        };
        int page = Math.max(filter.getPage(), 0);
        int size = (filter.getSize() > 0 && filter.getSize() <= 100) ? filter.getSize() : 20;
        return PageRequest.of(page, size, sort);
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
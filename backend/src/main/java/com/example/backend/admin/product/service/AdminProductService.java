package com.example.backend.admin.product.service;

import com.example.backend.admin.product.dto.*;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.dto.ProductRequest;
import com.example.backend.product.dto.VariantRequest;
import com.example.backend.product.entity.*;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.product.repository.ProductVariantRepository;
import com.example.backend.review.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository        productRepository;
    private final ProductVariantRepository variantRepository;
    private final FileStorageService       fileStorageService;

    //1. Thống kê tổng quan

    @Transactional(readOnly = true)
    public AdminProductStatsResponse getStats() {
        long total       = productRepository.count();
        long active      = productRepository.countByStatus(ProductStatus.ACTIVE);
        long inactive    = productRepository.countByStatus(ProductStatus.INACTIVE);
        long outOfStock  = productRepository.countByStatus(ProductStatus.OUT_OF_STOCK);
        long variants    = productRepository.countTotalVariants();
        long totalSold   = productRepository.sumTotalSoldCount();

        return new AdminProductStatsResponse(total, active, inactive, outOfStock, variants, totalSold);
    }

    // 2. Danh sách sản phẩm (filter + phân trang)

    @Transactional(readOnly = true)
    public PageResponse<AdminProductResponse> getProducts(AdminProductFilterRequest filter) {
        Pageable pageable  = buildPageable(filter);
        ProductStatus status = parseStatus(filter.getStatus());

        Page<Product> page = productRepository.filterProductsForAdmin(
                status,
                nullIfBlank(filter.getBrand()),
                nullIfBlank(filter.getCategory()),
                nullIfBlank(filter.getOs()),
                nullIfBlank(filter.getKeyword()),
                pageable
        );

        return PageResponse.from(page, AdminProductResponse::from);
    }

    //3. Chi tiết sản phẩm

    @Transactional(readOnly = true)
    public AdminProductResponse getProductDetail(Long id) {
        return AdminProductResponse.from(findProductWithVariants(id));
    }

    // 4. Tạo sản phẩm mới

    @Transactional
    public AdminProductResponse createProduct(ProductRequest request) {
        validateProductRequest(request);

        if (productRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new RuntimeException("Sản phẩm '" + request.getName() + "' đã tồn tại!");
        }

        Product product = mapBasicFields(new Product(), request);
        applyVariants(product, request);
        Product saved = productRepository.save(product);

        log.info("[Admin] Tạo sản phẩm id={} name='{}'", saved.getId(), saved.getName());
        return AdminProductResponse.from(saved);
    }

    //5. Cập nhật sản phẩm

    @Transactional
    public AdminProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProductWithVariants(id);
        validateProductRequest(request);

        String newName = request.getName().trim();
        if (!product.getName().equalsIgnoreCase(newName)
                && productRepository.existsByNameIgnoreCaseAndIdNot(newName, id)) {
            throw new RuntimeException("Sản phẩm '" + newName + "' đã tồn tại!");
        }

        mapBasicFields(product, request);

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            applyVariants(product, request);
        }

        Product saved = productRepository.save(product);
        log.info("[Admin] Cập nhật sản phẩm id={}", id);
        return AdminProductResponse.from(saved);
    }

    // 6. Cập nhật thông tin cơ bản (không đụng variants)

    @Transactional
    public AdminProductResponse updateProductBasicInfo(Long id, ProductRequest request) {
        Product product = findProductWithVariants(id);

        if (request.getName() != null) {
            String newName = request.getName().trim();
            if (!product.getName().equalsIgnoreCase(newName)
                    && productRepository.existsByNameIgnoreCaseAndIdNot(newName, id)) {
                throw new RuntimeException("Sản phẩm '" + newName + "' đã tồn tại!");
            }
        }

        mapBasicFields(product, request);
        return AdminProductResponse.from(productRepository.save(product));
    }

    //7. Ẩn sản phẩm (soft delete)

    @Transactional
    public void deactivateProduct(Long id) {
        Product product = findProduct(id);
        if (product.getStatus() == ProductStatus.INACTIVE) {
            throw new RuntimeException("Sản phẩm đã bị ẩn rồi!");
        }
        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
        log.info("[Admin] Ẩn sản phẩm id={}", id);
    }

    //8. Kích hoạt lại sản phẩm

    @Transactional
    public AdminProductResponse activateProduct(Long id) {
        Product product = findProduct(id);
        if (product.getStatus() == ProductStatus.ACTIVE) {
            throw new RuntimeException("Sản phẩm đã đang ACTIVE rồi!");
        }
        product.setStatus(ProductStatus.ACTIVE);
        log.info("[Admin] Kích hoạt sản phẩm id={}", id);
        return AdminProductResponse.from(productRepository.save(product));
    }

    //9. Xóa vĩnh viễn

    @Transactional
    public void hardDeleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm id: " + id);
        }
        productRepository.deleteById(id);
        log.info("[Admin] Xóa vĩnh viễn sản phẩm id={}", id);
    }

    //10. Bulk action

    @Transactional
    public BulkActionResponse bulkAction(BulkActionRequest request) {
        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm không được để trống!");
        }
        if (request.getAction() == null || request.getAction().isBlank()) {
            throw new RuntimeException("Thiếu trường 'action'!");
        }

        int success = 0;
        int fail    = 0;
        List<String> errors = new ArrayList<>();

        for (Long productId : request.getProductIds()) {
            try {
                switch (request.getAction().toUpperCase()) {
                    case "ACTIVATE"    -> activateProduct(productId);
                    case "DEACTIVATE",
                         "DELETE"     -> deactivateProduct(productId);
                    case "HARD_DELETE" -> hardDeleteProduct(productId);
                    default -> throw new RuntimeException("Action không hợp lệ: " + request.getAction());
                }
                success++;
            } catch (Exception e) {
                fail++;
                errors.add("productId=" + productId + ": " + e.getMessage());
                log.warn("[Admin] Bulk action lỗi productId={}: {}", productId, e.getMessage());
            }
        }

        String message = String.format("Thành công %d / %d sản phẩm.", success, request.getProductIds().size());
        return new BulkActionResponse(success, fail, errors, message);
    }

    // 11. Danh sách variant của 1 sản phẩm

    @Transactional(readOnly = true)
    public List<com.example.backend.product.dto.VariantResponse> getVariants(Long productId) {
        findProduct(productId); // validate exists
        return variantRepository.findByProductId(productId).stream()
                .map(com.example.backend.product.dto.VariantResponse::from)
                .collect(Collectors.toList());
    }

    //12. Thêm variant

    @Transactional
    public com.example.backend.product.dto.VariantResponse addVariant(Long productId, VariantRequest request) {
        Product product = findProduct(productId);
        validateVariantRequest(request);

        variantRepository.findByProductIdAndStorageAndColorIgnoreCase(
                productId, request.getStorage(), request.getColor()
        ).ifPresent(v -> {
            throw new RuntimeException(
                    "Variant '" + request.getStorage() + "GB - " + request.getColor() + "' đã tồn tại!");
        });

        ProductVariant variant = buildVariant(product, request);
        return com.example.backend.product.dto.VariantResponse.from(variantRepository.save(variant));
    }

    // 13. Cập nhật variant

    @Transactional
    public com.example.backend.product.dto.VariantResponse updateVariant(
            Long productId, Long variantId, VariantRequest request) {

        ProductVariant variant = findVariantOfProduct(variantId, productId);
        validateVariantRequest(request);

        variantRepository.findByProductIdAndStorageAndColorIgnoreCase(
                productId, request.getStorage(), request.getColor()
        ).ifPresent(existing -> {
            if (!existing.getId().equals(variantId)) {
                throw new RuntimeException(
                        "Variant '" + request.getStorage() + "GB - " + request.getColor() + "' đã tồn tại!");
            }
        });

        applyVariantFields(variant, request);

        // Tự động cập nhật status theo tồn kho
        if (variant.getStockQuantity() == 0 && variant.getStatus() == ProductStatus.ACTIVE) {
            variant.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (variant.getStockQuantity() > 0 && variant.getStatus() == ProductStatus.OUT_OF_STOCK) {
            variant.setStatus(ProductStatus.ACTIVE);
        }

        return com.example.backend.product.dto.VariantResponse.from(variantRepository.save(variant));
    }

    //14. Xóa variant

    @Transactional
    public void deleteVariant(Long productId, Long variantId) {
        ProductVariant variant = findVariantOfProduct(variantId, productId);

        long count = variantRepository.findByProductId(productId).size();
        if (count <= 1) {
            throw new RuntimeException(
                    "Sản phẩm phải có ít nhất 1 variant! Hãy thêm variant khác trước khi xóa.");
        }
        variantRepository.delete(variant);
        log.info("[Admin] Xóa variant id={} của sản phẩm id={}", variantId, productId);
    }

    // 15. Upload ảnh variant

    @Transactional
    public com.example.backend.product.dto.VariantResponse uploadVariantImages(
            Long productId, Long variantId, List<MultipartFile> files) {

        ProductVariant variant = findVariantOfProduct(variantId, productId);

        if (files == null || files.isEmpty()) {
            throw new RuntimeException("Không có file ảnh nào được gửi lên!");
        }

        int currentCount = variant.getImages() != null ? variant.getImages().size() : 0;
        int maxImages    = 6;

        if (currentCount + files.size() > maxImages) {
            throw new RuntimeException(
                    "Mỗi variant tối đa " + maxImages + " ảnh! "
                            + "Hiện có " + currentCount + ", còn chỗ cho " + (maxImages - currentCount) + " ảnh.");
        }

        int order = currentCount;
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;

            String imageUrl = fileStorageService.storeProductImage(file);
            ProductVariantImage image = new ProductVariantImage(variant, imageUrl, order++);
            variant.getImages().add(image);
        }

        return com.example.backend.product.dto.VariantResponse.from(variantRepository.save(variant));
    }

    // 16. Thêm ảnh bằng URL

    @Transactional
    public com.example.backend.product.dto.VariantResponse addVariantImageByUrl(
            Long productId, Long variantId, VariantImageRequest request) {

        ProductVariant variant = findVariantOfProduct(variantId, productId);

        if (request.getImageUrl() == null || request.getImageUrl().isBlank()) {
            throw new RuntimeException("URL ảnh không được để trống!");
        }
        if (!request.getImageUrl().startsWith("http://") && !request.getImageUrl().startsWith("https://")) {
            throw new RuntimeException("URL ảnh phải bắt đầu bằng http:// hoặc https://");
        }

        int order = request.getDisplayOrder() != null
                ? request.getDisplayOrder()
                : (variant.getImages() != null ? variant.getImages().size() : 0);

        ProductVariantImage image = new ProductVariantImage(
                variant, request.getImageUrl(), order);
        variant.getImages().add(image);

        return com.example.backend.product.dto.VariantResponse.from(variantRepository.save(variant));
    }

    //17. Xóa ảnh variant

    @Transactional
    public com.example.backend.product.dto.VariantResponse deleteVariantImage(
            Long productId, Long variantId, Long imageId) {

        ProductVariant variant = findVariantOfProduct(variantId, productId);

        ProductVariantImage target = variant.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy ảnh id: " + imageId));

        // Xóa file vật lý nếu là ảnh upload nội bộ
        deleteImageFile(target.getImageUrl());

        variant.getImages().remove(target);

        // Cập nhật lại displayOrder liên tục
        reorderImages(variant);

        return com.example.backend.product.dto.VariantResponse.from(variantRepository.save(variant));
    }

    //18. Sắp xếp lại thứ tự ảnh

    @Transactional
    public com.example.backend.product.dto.VariantResponse reorderVariantImages(
            Long productId, Long variantId, List<Long> imageIdOrders) {

        ProductVariant variant = findVariantOfProduct(variantId, productId);

        if (imageIdOrders == null || imageIdOrders.isEmpty()) {
            throw new RuntimeException("Danh sách imageId không được để trống!");
        }

        for (int i = 0; i < imageIdOrders.size(); i++) {
            final int order = i;
            final Long imgId = imageIdOrders.get(i);
            variant.getImages().stream()
                    .filter(img -> img.getId().equals(imgId))
                    .findFirst()
                    .ifPresent(img -> img.setDisplayOrder(order));
        }

        return com.example.backend.product.dto.VariantResponse.from(variantRepository.save(variant));
    }
    // PRIVATE HELPERS

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy sản phẩm id: " + id));
    }

    private Product findProductWithVariants(Long id) {
        return productRepository.findByIdWithVariants(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy sản phẩm id: " + id));
    }

    private ProductVariant findVariantOfProduct(Long variantId, Long productId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy variant id: " + variantId));
        if (!variant.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Variant này không thuộc sản phẩm id: " + productId);
        }
        return variant;
    }

    private void validateProductRequest(ProductRequest request) {
        if (request.getName() == null || request.getName().trim().length() < 2) {
            throw new RuntimeException("Tên sản phẩm phải có ít nhất 2 ký tự!");
        }
        if (request.getBrand() == null || request.getBrand().trim().isEmpty()) {
            throw new RuntimeException("Brand không được để trống!");
        }
    }

    private void validateVariantRequest(VariantRequest request) {
        if (request.getStorage() == null || request.getStorage() <= 0) {
            throw new RuntimeException("Dung lượng (storage) không hợp lệ!");
        }
        if (request.getColor() == null || request.getColor().trim().isEmpty()) {
            throw new RuntimeException("Màu sắc không được để trống!");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new RuntimeException("Giá variant phải lớn hơn 0!");
        }
        if (request.getDiscountPrice() != null && request.getDiscountPrice() >= request.getPrice()) {
            throw new RuntimeException("Giá khuyến mãi phải nhỏ hơn giá gốc!");
        }
        if (request.getStockQuantity() != null && request.getStockQuantity() < 0) {
            throw new RuntimeException("Tồn kho không được âm!");
        }
    }

    private Product mapBasicFields(Product product, ProductRequest req) {
        if (req.getName()        != null) product.setName(req.getName().trim());
        if (req.getBrand()       != null) product.setBrand(req.getBrand().trim());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getImageUrl()    != null) product.setImageUrl(req.getImageUrl());
        if (req.getRam()         != null) product.setRam(req.getRam());
        if (req.getScreenSize()  != null) product.setScreenSize(req.getScreenSize());
        if (req.getBatteryCapacity() != null) product.setBatteryCapacity(req.getBatteryCapacity());

        if (req.getCategory() != null) {
            try {
                product.setCategory(ProductCategory.valueOf(req.getCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Category không hợp lệ: " + req.getCategory());
            }
        }
        if (req.getOs() != null) {
            try {
                product.setOs(OperatingSystem.valueOf(req.getOs().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("OS không hợp lệ: " + req.getOs());
            }
        }
        if (req.getStatus() != null) {
            try {
                product.setStatus(ProductStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Status không hợp lệ: " + req.getStatus());
            }
        }
        return product;
    }

    private void applyVariants(Product product, ProductRequest req) {
        product.getVariants().clear();
        req.getVariants().forEach(variantReq -> {
            validateVariantRequest(variantReq);
            ProductVariant variant = buildVariant(product, variantReq);
            product.getVariants().add(variant);
        });
    }

    private ProductVariant buildVariant(Product product, VariantRequest req) {
        ProductVariant v = new ProductVariant();
        v.setProduct(product);
        applyVariantFields(v, req);
        return v;
    }

    private void applyVariantFields(ProductVariant v, VariantRequest req) {
        v.setStorage(req.getStorage());
        v.setColor(req.getColor().trim());
        v.setColorHex(req.getColorHex());
        v.setPrice(req.getPrice());
        v.setDiscountPrice(req.getDiscountPrice());
        v.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0);

        if (req.getStatus() != null) {
            try {
                v.setStatus(ProductStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Status không hợp lệ: " + req.getStatus());
            }
        }
    }

    private Pageable buildPageable(AdminProductFilterRequest filter) {
        Sort sort = switch (filter.getSortBy() != null ? filter.getSortBy() : "newest") {
            case "oldest"     -> Sort.by("createdAt").ascending();
            case "name_asc"   -> Sort.by("name").ascending();
            case "name_desc"  -> Sort.by("name").descending();
            case "bestseller" -> Sort.by("soldCount").descending();
            case "rating"     -> Sort.by("rating").descending();
            case "price_asc"  -> Sort.by("minPriceDb").ascending();
            case "price_desc" -> Sort.by("minPriceDb").descending();
            default           -> Sort.by("createdAt").descending();
        };
        int page = Math.max(filter.getPage(), 0);
        int size = (filter.getSize() > 0 && filter.getSize() <= 100) ? filter.getSize() : 20;
        return PageRequest.of(page, size, sort);
    }

    private ProductStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.isBlank() || statusStr.equalsIgnoreCase("all")) {
            return null;
        }
        try {
            return ProductStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Status không hợp lệ: " + statusStr);
        }
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private void reorderImages(ProductVariant variant) {
        List<ProductVariantImage> imgs = variant.getImages().stream()
                .sorted(java.util.Comparator.comparingInt(ProductVariantImage::getDisplayOrder))
                .collect(Collectors.toList());
        for (int i = 0; i < imgs.size(); i++) {
            imgs.get(i).setDisplayOrder(i);
        }
    }
    private void deleteImageFile(String imageUrl) {
        fileStorageService.deleteByUrl(imageUrl);
    }
}
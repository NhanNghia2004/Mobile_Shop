package com.example.backend.product.service;

import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.dto.ProductFilterRequest;
import com.example.backend.product.dto.ProductRequest;
import com.example.backend.product.dto.ProductResponse;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // ─────────────────────────────────────────────
    //  PUBLIC: lấy danh sách sản phẩm có filter
    // ─────────────────────────────────────────────

    public PageResponse<ProductResponse> getProducts(ProductFilterRequest filter) {
        Pageable pageable = buildPageable(filter);

        Page<Product> page = productRepository.filterProducts(
                nullIfBlank(filter.getBrand()),
                nullIfBlank(filter.getCategory()),
                nullIfBlank(filter.getOs()),
                filter.getMinPrice(),
                filter.getMaxPrice(),
                nullIfBlank(filter.getKeyword()),
                pageable
        );

        return PageResponse.from(page, ProductResponse::from);
    }

    // ─────────────────────────────────────────────
    //  PUBLIC: chi tiết sản phẩm
    // ─────────────────────────────────────────────

    public ProductResponse getProductById(Long id) {
        Product product = findActiveProductOrThrow(id);
        return ProductResponse.from(product);
    }

    // ─────────────────────────────────────────────
    //  PUBLIC: section đặc biệt
    // ─────────────────────────────────────────────

    public List<ProductResponse> getBestsellers() {
        return productRepository.findTop10ByStatusOrderBySoldCountDesc(ProductStatus.ACTIVE)
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> getNewArrivals() {
        return productRepository.findTop8ByStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE)
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public PageResponse<ProductResponse> getDiscountedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result = productRepository.findDiscountedProducts(pageable);
        return PageResponse.from(result, ProductResponse::from);
    }

    public List<String> getAllBrands() {
        return productRepository.findAllBrands();
    }

    // ─────────────────────────────────────────────
    //  ADMIN: CRUD
    // ─────────────────────────────────────────────

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        validateProductRequest(request);

        if (productRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new RuntimeException("Sản phẩm '" + request.getName() + "' đã tồn tại!");
        }

        Product product = mapToEntity(new Product(), request);
        Product saved = productRepository.save(product);
        return ProductResponse.from(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));

        validateProductRequest(request);

        mapToEntity(product, request);
        Product saved = productRepository.save(product);
        return ProductResponse.from(saved);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));

        // Soft delete: chuyển sang INACTIVE thay vì xoá thật
        product.setStatus(ProductStatus.INACTIVE);
        productRepository.save(product);
    }

    @Transactional
    public void hardDeleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sản phẩm với id: " + id);
        }
        productRepository.deleteById(id);
    }

    // Admin xem TẤT CẢ sản phẩm kể cả INACTIVE
    public PageResponse<ProductResponse> getAllProductsForAdmin(int page, int size, String sortBy) {
        Sort sort = buildSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> result = productRepository.findAll(pageable);
        return PageResponse.from(result, ProductResponse::from);
    }

    // Cập nhật số lượng tồn kho
    @Transactional
    public ProductResponse updateStock(Long id, int quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));

        if (quantity < 0) throw new RuntimeException("Số lượng tồn kho không được âm!");
        product.setStockQuantity(quantity);

        // Tự động cập nhật trạng thái nếu hết hàng
        if (quantity == 0 && product.getStatus() == ProductStatus.ACTIVE) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (quantity > 0 && product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }

        return ProductResponse.from(productRepository.save(product));
    }

    // ─────────────────────────────────────────────
    //  HELPER METHODS
    // ─────────────────────────────────────────────

    private Pageable buildPageable(ProductFilterRequest filter) {
        Sort sort = buildSort(filter.getSortBy());
        int page = Math.max(filter.getPage(), 0);
        int size = filter.getSize() > 0 && filter.getSize() <= 50 ? filter.getSize() : 12;
        return PageRequest.of(page, size, sort);
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null) return Sort.by("createdAt").descending();
        return switch (sortBy) {
            case "price_asc"   -> Sort.by("price").ascending();
            case "price_desc"  -> Sort.by("price").descending();
            case "newest"      -> Sort.by("createdAt").descending();
            case "bestseller"  -> Sort.by("soldCount").descending();
            case "rating"      -> Sort.by("rating").descending();
            default            -> Sort.by("createdAt").descending();
        };
    }

    private void validateProductRequest(ProductRequest request) {
        if (request.getName() == null || request.getName().trim().length() < 2)
            throw new RuntimeException("Tên sản phẩm phải có ít nhất 2 ký tự!");
        if (request.getBrand() == null || request.getBrand().trim().isEmpty())
            throw new RuntimeException("Brand không được để trống!");
        if (request.getPrice() == null || request.getPrice() <= 0)
            throw new RuntimeException("Giá sản phẩm phải lớn hơn 0!");
        if (request.getDiscountPrice() != null && request.getDiscountPrice() >= request.getPrice())
            throw new RuntimeException("Giá khuyến mãi phải nhỏ hơn giá gốc!");
        if (request.getStockQuantity() != null && request.getStockQuantity() < 0)
            throw new RuntimeException("Số lượng tồn kho không được âm!");
    }

    private Product mapToEntity(Product product, ProductRequest req) {
        product.setName(req.getName().trim());
        product.setBrand(req.getBrand().trim());
        product.setPrice(req.getPrice());
        product.setDiscountPrice(req.getDiscountPrice());
        product.setDescription(req.getDescription());
        product.setImageUrl(req.getImageUrl());
        product.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0);
        product.setCategory(req.getCategory());
        product.setOs(req.getOs());
        product.setRam(req.getRam());
        product.setStorage(req.getStorage());
        product.setScreenSize(req.getScreenSize());
        product.setBatteryCapacity(req.getBatteryCapacity());
        product.setColors(req.getColors());

        if (req.getStatus() != null) {
            try {
                product.setStatus(ProductStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Status không hợp lệ: " + req.getStatus());
            }
        }
        return product;
    }

    private Product findActiveProductOrThrow(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        if (product.getStatus() == ProductStatus.INACTIVE) {
            throw new RuntimeException("Sản phẩm này hiện không khả dụng!");
        }
        return product;
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
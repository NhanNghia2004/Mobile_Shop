package com.example.backend.product.service;

import com.example.backend.product.dto.*;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.product.dto.ParsedKeyword;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository    productRepository;
    private final ProductSearchService productSearchService;

    // ── PUBLIC
    public PageResponse<ProductResponse> getProducts(ProductFilterRequest filter) {
        validatePriceFilter(filter.getMinPrice(), filter.getMaxPrice());

        boolean hasKeyword = filter.getKeyword() != null && !filter.getKeyword().isBlank();

        if (hasKeyword) {
            // Smart search: parse keyword → query theo signal
            return productSearchService.search(filter);
        }

        // Filter thông thường (không có keyword)
        Pageable pageable = buildPageable(filter);
        Page<Product> page = productRepository.filterProducts(
                nullIfBlank(filter.getBrand()),
                nullIfBlank(filter.getCategory()),
                nullIfBlank(filter.getOs()),
                filter.getMinPrice(),
                filter.getMaxPrice(),
                null,
                pageable
        );

        List<ProductResponse> content = page.getContent().stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());

        String sortBy = filter.getSortBy();
        if ("price_asc".equals(sortBy)) {
            content.sort(Comparator.comparingDouble(r -> r.getMinPrice() != null ? r.getMinPrice() : 0));
        } else if ("price_desc".equals(sortBy)) {
            content.sort(Comparator.comparingDouble(
                    (ProductResponse r) -> r.getMinPrice() != null ? r.getMinPrice() : 0).reversed());
        }

        PageResponse<ProductResponse> response = new PageResponse<>();
        response.setContent(content);
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        return response;
    }

    public ProductResponse getProductById(Long id) {
        return ProductResponse.from(findActiveProductOrThrow(id));
    }

    public List<ProductResponse> getBestsellers() {
        Pageable limit = PageRequest.of(0, 10);
        return productRepository
                .findTop10ByStatusOrderBySoldCountDescWithVariants(ProductStatus.ACTIVE, limit)
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> getNewArrivals() {
        Pageable limit = PageRequest.of(0, 8);
        return productRepository
                .findTop8ByStatusOrderByCreatedAtDescWithVariants(ProductStatus.ACTIVE, limit)
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public PageResponse<ProductResponse> getDiscountedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.from(productRepository.findDiscountedProducts(pageable), ProductResponse::from);
    }

    public List<String> getAllBrands() {
        return productRepository.findAllBrands();
    }

    public PriceRangeResponse getPriceRange() {
        Object[] result = productRepository.findPriceRange();
        double min = result[0] != null ? ((Number) result[0]).doubleValue() : 0.0;
        double max = result[1] != null ? ((Number) result[1]).doubleValue() : 0.0;
        return new PriceRangeResponse(min, max);
    }

    public ParsedKeyword parseSearchKeyword(String keyword) {
        return productSearchService.parseKeyword(keyword);
    }

    // ── ADMIN

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        validateProductRequest(request);
        if (productRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new RuntimeException("Sản phẩm '" + request.getName() + "' đã tồn tại!");
        }
        Product product = mapBasicFields(new Product(), request);
        applyVariants(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
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
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
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

    public PageResponse<ProductResponse> getAllProductsForAdmin(int page, int size, String sortBy) {
        Sort sort = buildAdminSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return PageResponse.from(productRepository.findAllWithVariants(pageable), ProductResponse::from);
    }

    //HELPER
    private void validatePriceFilter(Double minPrice, Double maxPrice) {
        if (minPrice != null && minPrice < 0)
            throw new RuntimeException("Giá tối thiểu không được âm!");
        if (maxPrice != null && maxPrice < 0)
            throw new RuntimeException("Giá tối đa không được âm!");
        if (minPrice != null && maxPrice != null && minPrice > maxPrice)
            throw new RuntimeException("Giá tối thiểu không được lớn hơn giá tối đa!");
    }

    private Pageable buildPageable(ProductFilterRequest filter) {
        Sort sort = switch (filter.getSortBy() != null ? filter.getSortBy() : "newest") {
            case "price_asc", "price_desc" -> Sort.by("createdAt").descending();
            case "bestseller"              -> Sort.by("soldCount").descending();
            case "rating"                  -> Sort.by("rating").descending();
            default                        -> Sort.by("createdAt").descending();
        };
        int page = Math.max(filter.getPage(), 0);
        int size = (filter.getSize() > 0 && filter.getSize() <= 50) ? filter.getSize() : 12;
        return PageRequest.of(page, size, sort);
    }

    private Sort buildAdminSort(String sortBy) {
        if (sortBy == null) return Sort.by("createdAt").descending();
        return switch (sortBy) {
            case "bestseller" -> Sort.by("soldCount").descending();
            case "rating"     -> Sort.by("rating").descending();
            default           -> Sort.by("createdAt").descending();
        };
    }

    private void validateProductRequest(ProductRequest request) {
        if (request.getName() == null || request.getName().trim().length() < 2)
            throw new RuntimeException("Tên sản phẩm phải có ít nhất 2 ký tự!");
        if (request.getBrand() == null || request.getBrand().trim().isEmpty())
            throw new RuntimeException("Brand không được để trống!");
    }

    private Product mapBasicFields(Product product, ProductRequest req) {
        product.setName(req.getName().trim());
        product.setBrand(req.getBrand().trim());
        product.setDescription(req.getDescription());
        product.setImageUrl(req.getImageUrl());
        product.setCategory(req.getCategory());
        product.setOs(req.getOs());
        product.setRam(req.getRam());
        product.setScreenSize(req.getScreenSize());
        product.setBatteryCapacity(req.getBatteryCapacity());
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
            if (variantReq.getPrice() == null || variantReq.getPrice() <= 0)
                throw new RuntimeException("Giá variant phải lớn hơn 0!");
            if (variantReq.getStorage() == null || variantReq.getStorage() <= 0)
                throw new RuntimeException("Dung lượng variant không hợp lệ!");
            if (variantReq.getColor() == null || variantReq.getColor().isBlank())
                throw new RuntimeException("Màu sắc variant không được để trống!");
            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setStorage(variantReq.getStorage());
            variant.setColor(variantReq.getColor().trim());
            variant.setColorHex(variantReq.getColorHex());
            variant.setPrice(variantReq.getPrice());
            variant.setDiscountPrice(variantReq.getDiscountPrice());
            variant.setStockQuantity(variantReq.getStockQuantity() != null ? variantReq.getStockQuantity() : 0);
            variant.setImageUrl(variantReq.getImageUrl());
            product.getVariants().add(variant);
        });
    }

    private Product findActiveProductOrThrow(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + id));
        if (product.getStatus() == ProductStatus.INACTIVE)
            throw new RuntimeException("Sản phẩm này hiện không khả dụng!");
        return product;
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
package com.example.backend.product.service;

import com.example.backend.product.dto.*;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.product.dto.ParsedKeyword;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.example.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
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
                ProductStatus.ACTIVE,
                nullIfBlank(filter.getBrand()),
                nullIfBlank(filter.getCategory()),
                nullIfBlank(filter.getOs()),
                filter.getMinPrice(),
                filter.getMaxPrice(),
                null,
                pageable);

        List<ProductResponse> content = page.getContent().stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());

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
        return PageResponse.from(productRepository.findDiscountedProducts(ProductStatus.ACTIVE, pageable),
                ProductResponse::from);
    }

    public List<String> getAllBrands() {
        return productRepository.findAllBrands(ProductStatus.ACTIVE);
    }

    public PriceRangeResponse getPriceRange() {
        Object[] result = productRepository.findPriceRange(ProductStatus.ACTIVE);
        double min = result[0] != null ? ((Number) result[0]).doubleValue() : 0.0;
        double max = result[1] != null ? ((Number) result[1]).doubleValue() : 0.0;
        return new PriceRangeResponse(min, max);
    }

    public ParsedKeyword parseSearchKeyword(String keyword) {
        return productSearchService.parseKeyword(keyword);
    }

    // HELPER
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
            case "price_asc" -> Sort.by("minPriceDb").ascending();
            case "price_desc" -> Sort.by("minPriceDb").descending();
            case "bestseller" -> Sort.by("soldCount").descending();
            case "rating" -> Sort.by("rating").descending();
            default -> Sort.by("createdAt").descending();
        };
        int page = Math.max(filter.getPage(), 0);
        int size = (filter.getSize() > 0 && filter.getSize() <= 50) ? filter.getSize() : 12;
        return PageRequest.of(page, size, sort);
    }

    private Sort buildAdminSort(String sortBy) {
        if (sortBy == null)
            return Sort.by("createdAt").descending();
        return switch (sortBy) {
            case "bestseller" -> Sort.by("soldCount").descending();
            case "rating" -> Sort.by("rating").descending();
            default -> Sort.by("createdAt").descending();
        };
    }

    // Helpers for ProductService

    private Product findActiveProductOrThrow(Long id) {
        Product product = productRepository.findByIdWithVariants(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + id));
        if (product.getStatus() == ProductStatus.INACTIVE)
            throw new RuntimeException("Sản phẩm này hiện không khả dụng!");
        return product;
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
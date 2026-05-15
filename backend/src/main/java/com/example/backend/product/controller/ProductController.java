package com.example.backend.product.controller;

import com.example.backend.product.dto.*;
import com.example.backend.product.dto.ParsedKeyword;
import com.example.backend.product.service.ProductSuggestionService;
import com.example.backend.product.dto.SearchSuggestionResponse;
import com.example.backend.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService           productService;
    private final ProductSuggestionService suggestionService;

    // Danh sách sản phẩm + smart search
    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getProducts(
            @RequestParam(required = false)                          String keyword,
            @RequestParam(required = false)                          String brand,
            @RequestParam(required = false)                          String category,
            @RequestParam(required = false)                          String os,
            @RequestParam(required = false)                          Double minPrice,
            @RequestParam(required = false)                          Double maxPrice,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(required = false, defaultValue = "0")      int    page,
            @RequestParam(required = false, defaultValue = "12")     int    size
    ) {
        ProductFilterRequest filter = new ProductFilterRequest();
        filter.setKeyword(keyword);
        filter.setBrand(brand);
        filter.setCategory(category);
        filter.setOs(os);
        filter.setMinPrice(minPrice);
        filter.setMaxPrice(maxPrice);
        filter.setSortBy(sortBy);
        filter.setPage(page);
        filter.setSize(size);
        return ResponseEntity.ok(productService.getProducts(filter));
    }

    @GetMapping("/search/suggestions")
    public ResponseEntity<SearchSuggestionResponse> getSuggestions(@RequestParam String q) {
        return ResponseEntity.ok(suggestionService.getSuggestions(q));
    }

    @GetMapping("/search/parse")
    public ResponseEntity<ParsedKeyword> parseKeyword(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.parseSearchKeyword(keyword));
    }

    // Chi tiết sản phẩm
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // Top bán chạy
    @GetMapping("/bestsellers")
    public ResponseEntity<List<ProductResponse>> getBestsellers() {
        return ResponseEntity.ok(productService.getBestsellers());
    }

    // Hàng mới về
    @GetMapping("/new-arrivals")
    public ResponseEntity<List<ProductResponse>> getNewArrivals() {
        return ResponseEntity.ok(productService.getNewArrivals());
    }

    // Đang giảm giá
    @GetMapping("/deals")
    public ResponseEntity<PageResponse<ProductResponse>> getDeals(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(productService.getDiscountedProducts(page, size));
    }

    // Danh sách thương hiệu
    @GetMapping("/brands")
    public ResponseEntity<List<String>> getBrands() {
        return ResponseEntity.ok(productService.getAllBrands());
    }

    // Khoảng giá min/max
    @GetMapping("/price-range")
    public ResponseEntity<PriceRangeResponse> getPriceRange() {
        return ResponseEntity.ok(productService.getPriceRange());
    }
}
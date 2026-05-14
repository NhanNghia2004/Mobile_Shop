package com.example.backend.product.service;

import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.dto.ProductFilterRequest;
import com.example.backend.product.dto.ProductRequest;
import com.example.backend.product.dto.ProductResponse;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.repository.ProductRepository;
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

    private final ProductRepository productRepository;

    //PUBLIC

    public PageResponse<ProductResponse> getProducts(ProductFilterRequest filter) {
        // FIX #7: validate minPrice < maxPrice
        if (filter.getMinPrice() != null && filter.getMaxPrice() != null
                && filter.getMinPrice() > filter.getMaxPrice()) {
            throw new RuntimeException("minPrice không được lớn hơn maxPrice!");
        }

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

        //sort theo giá thực hiện sau khi fetch (giá nằm ở variant)
        List<ProductResponse> content = page.getContent()
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());

        String sortBy = filter.getSortBy();
        if ("price_asc".equals(sortBy)) {
            content.sort(Comparator.comparingDouble(r -> r.getMinPrice() != null ? r.getMinPrice() : 0));
        } else if ("price_desc".equals(sortBy)) {
            content.sort(Comparator.comparingDouble((ProductResponse r) ->
                    r.getMinPrice() != null ? r.getMinPrice() : 0).reversed());
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
        Product product = findActiveProductOrThrow(id);
        return ProductResponse.from(product);
    }

    public List<ProductResponse> getBestsellers() {
        //  dùng query có JOIN FETCH, giới hạn 10
        Pageable limit = PageRequest.of(0, 10);
        return productRepository
                .findTop10ByStatusOrderBySoldCountDescWithVariants(ProductStatus.ACTIVE, limit)
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> getNewArrivals() {
        //  dùng query có JOIN FETCH, giới hạn 8
        Pageable limit = PageRequest.of(0, 8);
        return productRepository
                .findTop8ByStatusOrderByCreatedAtDescWithVariants(ProductStatus.ACTIVE, limit)
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

    //ADMIN

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

        //kiểm tra tên trùng khi update (loại trừ chính nó)
        String newName = request.getName().trim();
        if (!product.getName().equalsIgnoreCase(newName)
                && productRepository.existsByNameIgnoreCaseAndIdNot(newName, id)) {
            throw new RuntimeException("Sản phẩm '" + newName + "' đã tồn tại!");
        }

        mapBasicFields(product, request);


        // Nếu variants null → chỉ update thông tin sản phẩm, giữ nguyên variants cũ
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
        // FIX #5: fetch variants cùng lúc
        Page<Product> result = productRepository.findAllWithVariants(pageable);
        return PageResponse.from(result, ProductResponse::from);
    }

    @Transactional
    public ProductResponse updateStock(Long id, int quantity) {
        throw new RuntimeException(
                "Tồn kho quản lý theo variant! Dùng: PATCH /api/admin/products/{id}/variants/{variantId}/stock"
        );
    }

    // HELPER

    private Pageable buildPageable(ProductFilterRequest filter) {
        // FIX #2: price_asc/desc sort ở tầng Java sau fetch → truyền createdAt để DB không cần sort theo giá
        Sort sort = switch (filter.getSortBy() != null ? filter.getSortBy() : "newest") {
            case "price_asc", "price_desc" -> Sort.by("createdAt").descending(); // sẽ re-sort ở Java
            case "bestseller" -> Sort.by("soldCount").descending();
            case "rating"     -> Sort.by("rating").descending();
            default           -> Sort.by("createdAt").descending();
        };
        int page = Math.max(filter.getPage(), 0);
        int size = filter.getSize() > 0 && filter.getSize() <= 50 ? filter.getSize() : 12;
        return PageRequest.of(page, size, sort);
    }

    private Sort buildAdminSort(String sortBy) {
        if (sortBy == null) return Sort.by("createdAt").descending();
        return switch (sortBy) {
            case "newest"     -> Sort.by("createdAt").descending();
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

    // Chỉ map các field cơ bản của Product (không động vào variants)
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

    //tách riêng logic xử lý variants
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
            variant.setStockQuantity(
                    variantReq.getStockQuantity() != null ? variantReq.getStockQuantity() : 0
            );
            variant.setImageUrl(variantReq.getImageUrl());
            product.getVariants().add(variant);
        });
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
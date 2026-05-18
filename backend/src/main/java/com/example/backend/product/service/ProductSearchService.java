package com.example.backend.product.service;

import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.dto.ParsedKeyword;
import com.example.backend.product.dto.ProductFilterRequest;
import com.example.backend.product.dto.ProductResponse;
import com.example.backend.product.entity.Product;
import com.example.backend.product.repository.ProductSearchRepository;
import com.example.backend.product.dto.SearchKeywordParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class ProductSearchService {

    private final SearchKeywordParser parser;
    private final ProductSearchRepository searchRepository;

    public PageResponse<ProductResponse> search(ProductFilterRequest filter) {
        String rawKeyword = filter.getKeyword();
        ParsedKeyword parsed = parser.parse(rawKeyword);

        log.debug("Smart search | raw='{}' → storage={}, ram={}, colors={}, os={}, tokens={}",
                rawKeyword, parsed.getStorageGb(), parsed.getRamGb(),
                parsed.getColors(), parsed.getOs(), parsed.getTextTokens());

        Pageable pageable = buildPageable(filter);

        // Lấy tối đa 3 text token đầu tiên (thêm token chỉ làm query chậm, ít lợi)
        List<String> tokens = parsed.getTextTokens();
        String t1 = tokens.size() > 0 ? tokens.get(0) : null;
        String t2 = tokens.size() > 1 ? tokens.get(1) : null;
        String t3 = tokens.size() > 2 ? tokens.get(2) : null;

        // Màu: nếu parse được nhiều màu → lấy màu đầu tiên (match chính xác nhất)
        String color = parsed.getColors().isEmpty() ? null : parsed.getColors().get(0);

        Page<Product> page = searchRepository.smartSearch(
                parsed.getOs(),
                parsed.getRamGb(),
                parsed.getStorageGb(),
                color,
                filter.getMinPrice(),  // thêm
                filter.getMaxPrice(),  // thêm
                t1, t2, t3,
                pageable
        );

        // Re-sort theo giá ở tầng Java
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

    public ParsedKeyword parseKeyword(String keyword) {
        return parser.parse(keyword);
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
}
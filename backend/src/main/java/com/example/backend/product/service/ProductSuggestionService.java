package com.example.backend.product.service;

import com.example.backend.product.repository.ProductSuggestionRepository;
import com.example.backend.product.dto.SearchSuggestionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProductSuggestionService {

    private final ProductSuggestionRepository suggestionRepository;

    private static final int MAX_BRANDS    = 2;
    private static final int MAX_STORAGES  = 2;
    private static final int MAX_RAMS      = 2;
    private static final int MAX_COLORS    = 2;
    private static final int MAX_PRODUCTS  = 4;
    private static final int MIN_QUERY_LEN = 2;  // bắt đầu gợi ý từ 2 ký tự

    // Pattern để nhận dạng input đang gõ là số (thuần số hoặc số + "gb"/"tb")
    private static final Pattern NUMERIC_PATTERN =
            Pattern.compile("^\\d+(?:gb|tb)?$", Pattern.CASE_INSENSITIVE);

    public SearchSuggestionResponse getSuggestions(String raw) {
        SearchSuggestionResponse response = new SearchSuggestionResponse();

        if (raw == null || raw.trim().length() < MIN_QUERY_LEN) {
            response.setSuggestions(Collections.emptyList());
            return response;
        }

        String q = raw.trim().toLowerCase();
        // Tách số thuần ra khỏi đơn vị
        String numericPart = q.replaceAll("[^0-9]", "");

        List<SearchSuggestionResponse.Suggestion> results = new ArrayList<>();

        boolean looksNumeric = NUMERIC_PATTERN.matcher(q).matches();

        if (looksNumeric && !numericPart.isEmpty()) {
            addStorageSuggestions(results, numericPart);
            addRamSuggestions(results, numericPart);
            addProductSuggestions(results, q);
        } else {
            addBrandSuggestions(results, q);
            addColorSuggestions(results, q);
            addProductSuggestions(results, q);

            if (!numericPart.isEmpty()) {
                addStorageSuggestions(results, numericPart);
                addRamSuggestions(results, numericPart);
            }
        }

        response.setSuggestions(results);
        return response;
    }

    // private builders

    private void addBrandSuggestions(List<SearchSuggestionResponse.Suggestion> out, String q) {
        suggestionRepository.suggestByBrand(q, MAX_BRANDS).forEach(row -> {
            String brand = (String) row[0];
            Long   count = (Long)   row[1];
            out.add(new SearchSuggestionResponse.Suggestion(
                    "brand",
                    brand,
                    brand,
                    null,
                    null,
                    count
            ));
        });
    }

    private void addStorageSuggestions(List<SearchSuggestionResponse.Suggestion> out, String numericQ) {
        suggestionRepository.suggestByStorage(numericQ, MAX_STORAGES).forEach(row -> {
            Integer storage = (Integer) row[0];
            Long    count   = (Long)    row[1];
            String  label   = storage >= 1024
                    ? (storage / 1024) + "TB"
                    : storage + "GB";
            out.add(new SearchSuggestionResponse.Suggestion(
                    "storage",
                    label,
                    label,
                    null,
                    null,
                    count
            ));
        });
    }

    private void addRamSuggestions(List<SearchSuggestionResponse.Suggestion> out, String numericQ) {
        suggestionRepository.suggestByRam(numericQ, MAX_RAMS).forEach(row -> {
            Integer ram   = (Integer) row[0];
            Long    count = (Long)    row[1];
            String  label = "RAM " + ram + "GB";
            out.add(new SearchSuggestionResponse.Suggestion(
                    "ram",
                    label,
                    "ram " + ram + "gb",
                    null,
                    null,
                    count
            ));
        });
    }

    private void addColorSuggestions(List<SearchSuggestionResponse.Suggestion> out, String q) {
        suggestionRepository.suggestByColor(q, MAX_COLORS).forEach(row -> {
            String color = (String) row[0];
            Long   count = (Long)   row[1];
            out.add(new SearchSuggestionResponse.Suggestion(
                    "color",
                    "Màu " + color,
                    color,
                    null,
                    null,
                    count
            ));
        });
    }

    private void addProductSuggestions(List<SearchSuggestionResponse.Suggestion> out, String q) {
        suggestionRepository.suggestByName(q, MAX_PRODUCTS).forEach(row -> {
            String name     = (String) row[0];
            String imageUrl = (String) row[1];

            out.add(new SearchSuggestionResponse.Suggestion(
                    "product",
                    name,
                    name,
                    null,
                    imageUrl,
                    null
            ));
        });
    }
}
package com.example.backend.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
public class SearchSuggestionResponse {

    private List<Suggestion> suggestions;

    @Data
    @AllArgsConstructor
    public static class Suggestion {
        private String type;
        private String label;
        private String value;
        private String imageUrl;
        private Long   count;
    }
}
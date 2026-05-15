package com.example.backend.product.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;


@Data
public class ParsedKeyword {

    private Integer storageGb;

    private Integer ramGb;

    private List<String> colors = new ArrayList<>();

    private String os;

    private List<String> textTokens = new ArrayList<>();

    private String rawKeyword;

    public boolean isEmpty() {
        return storageGb == null
                && ramGb == null
                && colors.isEmpty()
                && os == null
                && textTokens.isEmpty();
    }
}
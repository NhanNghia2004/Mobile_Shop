package com.example.backend.review.controller;

import com.example.backend.product.dto.ProductResponse;
import com.example.backend.review.service.RelatedProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/related")
@RequiredArgsConstructor
public class RelatedProductController {

    private final RelatedProductService relatedProductService;


    @GetMapping
    public ResponseEntity<List<ProductResponse>> getRelated(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "8") int limit
    ) {
        if (limit < 1 || limit > 20) limit = 8;
        return ResponseEntity.ok(relatedProductService.getRelated(productId, limit));
    }
}
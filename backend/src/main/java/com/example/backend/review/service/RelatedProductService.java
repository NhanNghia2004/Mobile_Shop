package com.example.backend.review.service;

import com.example.backend.product.dto.ProductResponse;
import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.review.repository.RelatedProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatedProductService {

    private final ProductRepository productRepository;
    private final RelatedProductRepository relatedProductRepository;

    /**
     * Lấy tối đa `limit` sản phẩm cùng brand + category, loại trừ chính nó.
     * Ưu tiên: cùng brand + category trước, nếu không đủ thì bổ sung cùng brand.
     */
    public List<ProductResponse> getRelated(Long productId, int limit) {
        Product target = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy sản phẩm id: " + productId));

        // Lấy cùng brand + category
        List<Product> related = relatedProductRepository
                .findRelatedBySameBrandAndCategory(
                        productId,
                        target.getBrand(),
                        target.getCategory(),
                        ProductStatus.ACTIVE,
                        PageRequest.of(0, limit)
                );

        // Nếu chưa đủ → bổ sung cùng brand, khác category
        if (related.size() < limit) {
            int remaining = limit - related.size();
            List<Long> existingIds = related.stream()
                    .map(Product::getId)
                    .collect(Collectors.toList());
            existingIds.add(productId);

            List<Product> extra = relatedProductRepository
                    .findRelatedBySameBrandExcluding(
                            existingIds,
                            target.getBrand(),
                            ProductStatus.ACTIVE,
                            PageRequest.of(0, remaining)
                    );
            related.addAll(extra);
        }

        return related.stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }
}
package com.example.backend.chat.service;

import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private GroqService groqService;

    // Cache lưu trữ embedding vector của từng sản phẩm để tránh gọi API lặp đi lặp lại
    private final Map<Long, float[]> productVectorCache = new ConcurrentHashMap<>();

    // Cache lưu trữ chuỗi text mô tả chi tiết của từng sản phẩm
    private final Map<Long, String> productTextCache = new ConcurrentHashMap<>();

    private static final String SYSTEM_PROMPT_TEMPLATE =
        "Bạn là trợ lý ảo của cửa hàng điện thoại MobiShop. Nhiệm vụ của bạn là tư vấn khách hàng mua điện thoại di động.\n" +
        "Dưới đây là thông tin thực tế về các sản phẩm liên quan đang bán tại cửa hàng chúng tôi (Context):\n" +
        "-------------------\n" +
        "%s\n" +
        "-------------------\n" +
        "Quy tắc phản hồi:\n" +
        "1. Bạn CHỈ ĐƯỢC PHÉP tư vấn và trả lời dựa trên các sản phẩm và thông tin được cung cấp trong Context ở trên.\n" +
        "2. Nếu Context trống hoặc không chứa thông tin về sản phẩm khách hỏi, hãy lịch sự báo rằng cửa hàng hiện chưa có dòng sản phẩm này, hoặc hướng dẫn họ xem thêm các dòng khác đang bán.\n" +
        "3. Nếu khách hàng hỏi các chủ đề hoàn toàn ngoài lề (ví dụ: thời tiết, lập trình, nấu ăn, toán học, v.v.), bạn phải từ chối một cách lịch sự và nói rằng bạn chỉ hỗ trợ tư vấn điện thoại tại MobiShop.\n" +
        "4. Hãy trả lời ngắn gọn, thân thiện, trung thực và súc tích bằng tiếng Việt.";

    public String getChatResponse(String userMessage) {
        // 1. Tải toàn bộ sản phẩm ACTIVE từ DB
        List<Product> products = productRepository.findByStatusWithVariants(ProductStatus.ACTIVE);
        if (products.isEmpty()) {
            return "Chào bạn! Hiện tại cửa hàng chưa cập nhật sản phẩm nào nên mình chưa thể tư vấn chi tiết được. Vui lòng quay lại sau nhé!";
        }

        // 2. Tạo vector biểu diễn (Embedding) cho câu hỏi của User
        float[] queryVector = embeddingService.getEmbedding(userMessage);

        String context = "";
        if (queryVector != null) {
            // RAG: So sánh độ tương đồng cosine và lấy top 3 sản phẩm liên quan nhất
            context = getRelevantProductsContext(products, queryVector);
        } else {
            // Fallback: Nếu không tạo được vector (ví dụ mất mạng, sai key), ta gộp thông tin cơ bản làm ngữ cảnh
            context = getBasicFallbackContext(products);
        }

        // 3. Dựng System Prompt kết hợp Context
        String systemPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, context);

        // 4. Gửi sang GROQ LLM để sinh câu trả lời
        return groqService.getChatCompletion(systemPrompt, userMessage);
    }

    private String getRelevantProductsContext(List<Product> products, float[] queryVector) {
        List<ProductSimilarity> similarities = new ArrayList<>();

        for (Product product : products) {
            // Sinh chuỗi mô tả sản phẩm (Name, Brand, OS, Specs, Price, Stock)
            String productText = productTextCache.computeIfAbsent(product.getId(), id -> buildProductDescription(product));

            // Lấy hoặc sinh Vector Embedding của sản phẩm
            float[] productVector = productVectorCache.computeIfAbsent(product.getId(), id -> embeddingService.getEmbedding(productText));

            if (productVector != null) {
                double score = cosineSimilarity(queryVector, productVector);
                similarities.add(new ProductSimilarity(product, productText, score));
            }
        }

        // Sắp xếp giảm dần theo điểm tương đồng
        similarities.sort((a, b) -> Double.compare(b.similarityScore, a.similarityScore));

        // Lấy top 3 sản phẩm liên quan nhất có score > 0.3
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (ProductSimilarity ps : similarities) {
            if (ps.similarityScore >= 0.3 && count < 3) {
                sb.append(ps.descriptionText).append("\n---\n");
                count++;
            }
        }

        return sb.toString();
    }

    private String getBasicFallbackContext(List<Product> products) {
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (Product p : products) {
            if (count >= 5) break; // Chỉ lấy tối đa 5 sản phẩm làm context nếu không có embedding
            sb.append(buildProductDescription(p)).append("\n---\n");
            count++;
        }
        return sb.toString();
    }

    private String buildProductDescription(Product product) {
        StringBuilder sb = new StringBuilder();
        sb.append("Tên sản phẩm: ").append(product.getName()).append("\n");
        sb.append("Thương hiệu: ").append(product.getBrand()).append("\n");
        sb.append("Danh mục: ").append(product.getCategory()).append("\n");
        if (product.getOs() != null) sb.append("Hệ điều hành: ").append(product.getOs()).append("\n");
        if (product.getScreenSize() != null) sb.append("Màn hình: ").append(product.getScreenSize()).append(" inches\n");
        if (product.getBatteryCapacity() != null) sb.append("Dung lượng pin: ").append(product.getBatteryCapacity()).append(" mAh\n");
        if (product.getRam() != null) sb.append("RAM mặc định: ").append(product.getRam()).append(" GB\n");
        if (product.getDescription() != null && !product.getDescription().trim().isEmpty()) {
            sb.append("Mô tả ngắn: ").append(product.getDescription()).append("\n");
        }

        // Các phiên bản cấu hình và giá
        sb.append("Các phiên bản đang có:\n");
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            for (ProductVariant v : product.getVariants()) {
                if (v.getStatus() == ProductStatus.ACTIVE) {
                    sb.append("- ").append(v.getStorage()).append("GB, màu ")
                      .append(v.getColor()).append(": Giá bán ")
                      .append(v.getDisplayPrice().intValue()).append("đ");
                    if (v.getStockQuantity() == 0) {
                        sb.append(" (Hết hàng)\n");
                    } else {
                        sb.append(" (Còn lại ").append(v.getStockQuantity()).append(" sản phẩm trong kho)\n");
                    }
                }
            }
        } else {
            sb.append("- Chưa có phiên bản cụ thể.\n");
        }

        return sb.toString();
    }

    private double cosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA.length != vectorB.length) return 0.0;
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private static class ProductSimilarity {
        Product product;
        String descriptionText;
        double similarityScore;

        public ProductSimilarity(Product product, String descriptionText, double similarityScore) {
            this.product = product;
            this.descriptionText = descriptionText;
            this.similarityScore = similarityScore;
        }
    }

    private String ruleBasedFallback(String message) {
        return "Chào bạn, hệ thống AI của cửa hàng hiện đang bận hoặc đang bảo trì. Bạn vui lòng quay lại sau ít phút nhé!";
    }
}

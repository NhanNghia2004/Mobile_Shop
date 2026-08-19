package com.example.backend.chat.service;

import com.example.backend.product.entity.Product;
import com.example.backend.product.entity.ProductStatus;
import com.example.backend.product.entity.ProductVariant;
import com.example.backend.product.repository.ProductRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class AiChatService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private GroqService groqService;

    private static final String VECTOR_STORE_FILE = "vector_store.json";
    private final ObjectMapper objectMapper = new ObjectMapper();

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
        "4. Hãy trả lời ngắn gọn, thân thiện, trung thực và súc tích bằng tiếng Việt.\n" +
        "5. Khi đề cập đến bất kỳ sản phẩm nào có trong Context, bạn bắt buộc phải tạo đường dẫn liên kết đến chi tiết sản phẩm đó theo định dạng markdown: `[Tên điện thoại](/product/ID)`. Ví dụ: nếu sản phẩm có ID là 12, hãy viết `[iPhone 15 Pro Max](/product/12)`. Tuyệt đối không tự bịa ID sản phẩm nếu nó không nằm trong Context.";

    public String getChatResponse(String userMessage) {
        // 1. Tải toàn bộ sản phẩm ACTIVE từ DB
        List<Product> products = productRepository.findByStatusWithVariants(ProductStatus.ACTIVE);
        if (products.isEmpty()) {
            return "Chào bạn! Hiện tại cửa hàng chưa cập nhật sản phẩm nào nên mình chưa thể tư vấn chi tiết được. Vui lòng quay lại sau nhé!";
        }

        // 2. Load hoặc Rebuild Vector Store
        List<VectorDocument> vectorStore = loadOrRebuildVectorStore(products);

        // 3. Tạo vector biểu diễn cho câu hỏi của User
        float[] queryVector = embeddingService.getEmbedding(userMessage);

        String context = "";
        if (queryVector != null && !vectorStore.isEmpty()) {
            // 4. Similarity Search: Tìm Top 5 sản phẩm tương thích nhất
            context = similaritySearch(vectorStore, queryVector, userMessage);
        } else {
            // Fallback: Tìm kiếm cơ bản theo từ khóa nếu lỗi Embedding
            context = getBasicFallbackContext(products, userMessage);
        }

        // 5. Dựng System Prompt kết hợp Context (Giới hạn tối đa 2500 ký tự để an toàn tuyệt đối)
        if (context.length() > 2500) {
            context = context.substring(0, 2500) + "\n...[Đã rút gọn context]";
        }
        String systemPrompt = String.format(SYSTEM_PROMPT_TEMPLATE, context);

        // 6. Gửi sang GROQ LLM để sinh câu trả lời
        return groqService.getChatCompletion(systemPrompt, userMessage);
    }

    private synchronized List<VectorDocument> loadOrRebuildVectorStore(List<Product> products) {
        File file = new File(VECTOR_STORE_FILE);
        List<VectorDocument> store = new ArrayList<>();

        if (file.exists()) {
            try {
                store = objectMapper.readValue(file, new TypeReference<List<VectorDocument>>() {});
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        // Kiểm tra xem store có cần đồng bộ/rebuild không (so sánh số lượng hoặc nội dung cơ bản)
        boolean needsRebuild = store.isEmpty() || (store.size() != products.size());
        
        if (!needsRebuild) {
            // Kiểm tra sâu hơn: xem các ID sản phẩm active có khớp hoàn toàn không
            Set<Long> dbIds = new HashSet<>();
            for (Product p : products) {
                dbIds.add(p.getId());
            }
            Set<Long> storeIds = new HashSet<>();
            for (VectorDocument doc : store) {
                storeIds.add(doc.getId());
            }
            if (!dbIds.equals(storeIds)) {
                needsRebuild = true;
            }
        }

        if (needsRebuild) {
            store = rebuildVectorStore(products);
        }

        return store;
    }

    private List<VectorDocument> rebuildVectorStore(List<Product> products) {
        List<VectorDocument> newStore = new ArrayList<>();
        for (Product product : products) {
            String text = buildProductDescription(product);
            float[] vector = embeddingService.getEmbedding(text);
            
            List<Float> vectorList = new ArrayList<>();
            if (vector != null) {
                for (float v : vector) {
                    vectorList.add(v);
                }
            }

            VectorDocument doc = new VectorDocument(product.getId(), product.getName(), text, vectorList);
            newStore.add(doc);
        }

        // Lưu xuống file json
        try {
            objectMapper.writeValue(new File(VECTOR_STORE_FILE), newStore);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return newStore;
    }

    private double calculateKeywordScore(String query, String productName) {
        String q = query.toLowerCase();
        String p = productName.toLowerCase();
        
        double score = 0.0;
        if (q.contains(p) || p.contains(q)) {
            score += 2.0; // Rất khớp trực tiếp
        }
        
        // Tách các từ trong tên sản phẩm
        String[] pWords = p.split("\\s+");
        int matchedWords = 0;
        int significantWords = 0;
        
        for (String w : pWords) {
            // Loại bỏ các từ chung chung khi tính điểm từ khóa quan trọng
            if (w.length() > 1 && !w.equals("apple") && !w.equals("điện") && !w.equals("thoại") && !w.equals("gb")) {
                significantWords++;
                if (q.contains(w)) {
                    matchedWords++;
                }
            }
        }
        
        if (significantWords > 0) {
            score += (double) matchedWords / significantWords;
        }
        
        return score;
    }

    private String similaritySearch(List<VectorDocument> store, float[] queryVector, String userMessage) {
        List<SearchResult> results = new ArrayList<>();

        for (VectorDocument doc : store) {
            double score = calculateKeywordScore(userMessage, doc.getName());

            if (!doc.getVector().isEmpty() && queryVector != null) {
                float[] docVector = new float[doc.getVector().size()];
                for (int i = 0; i < doc.getVector().size(); i++) {
                    docVector[i] = doc.getVector().get(i);
                }
                score += cosineSimilarity(queryVector, docVector);
            }

            results.add(new SearchResult(doc, score));
        }

        // Sắp xếp giảm dần theo điểm
        results.sort((a, b) -> Double.compare(b.score, a.score));

        // Lấy Top 5 kết quả tốt nhất
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (SearchResult res : results) {
            if (res.score >= 0.1 && count < 5) {
                sb.append(res.doc.getText()).append("\n---\n");
                count++;
            }
        }

        return sb.toString();
    }

    private String getBasicFallbackContext(List<Product> products, String userMessage) {
        StringBuilder sb = new StringBuilder();
        
        // Tạo danh sách cặp Product và Điểm khớp từ khóa
        class ProductScore {
            Product product;
            double score;
            ProductScore(Product product, double score) {
                this.product = product;
                this.score = score;
            }
        }
        
        List<ProductScore> scoredProducts = new ArrayList<>();
        for (Product p : products) {
            double score = calculateKeywordScore(userMessage, p.getName());
            scoredProducts.add(new ProductScore(p, score));
        }
        
        // Sắp xếp giảm dần theo điểm số
        scoredProducts.sort((a, b) -> Double.compare(b.score, a.score));
        
        int count = 0;
        for (ProductScore ps : scoredProducts) {
            if (count >= 5) break;
            sb.append(buildProductDescription(ps.product)).append("\n---\n");
            count++;
        }
        
        return sb.toString();
    }

    private String buildProductDescription(Product product) {
        StringBuilder sb = new StringBuilder();
        sb.append("ID sản phẩm: ").append(product.getId()).append("\n");
        sb.append("Tên sản phẩm: ").append(product.getName()).append("\n");
        sb.append("Thương hiệu: ").append(product.getBrand()).append("\n");
        sb.append("Danh mục: ").append(product.getCategory()).append("\n");
        if (product.getOs() != null) sb.append("Hệ điều hành: ").append(product.getOs()).append("\n");
        if (product.getScreenSize() != null) sb.append("Màn hình: ").append(product.getScreenSize()).append(" inches\n");
        if (product.getBatteryCapacity() != null) sb.append("Dung lượng pin: ").append(product.getBatteryCapacity()).append(" mAh\n");
        if (product.getRam() != null) sb.append("RAM mặc định: ").append(product.getRam()).append(" GB\n");
        if (product.getDescription() != null && !product.getDescription().trim().isEmpty()) {
            String desc = product.getDescription().replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
            if (desc.length() > 200) {
                desc = desc.substring(0, 200) + "...";
            }
            sb.append("Mô tả ngắn: ").append(desc).append("\n");
        }

        sb.append("Tình trạng: SẢN PHẨM ĐANG CÓ BÁN\n");
        sb.append("Các phiên bản chi tiết:\n");
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            for (ProductVariant v : product.getVariants()) {
                if (v.getStatus() == ProductStatus.ACTIVE) {
                    sb.append("- ").append(v.getStorage()).append("GB, màu ")
                      .append(v.getColor()).append(": Giá bán ")
                      .append(v.getDisplayPrice().intValue()).append("đ");
                    if (v.getStockQuantity() == 0) {
                        sb.append(" (Hết hàng tạm thời)\n");
                    } else {
                        sb.append(" (Còn hàng)\n");
                    }
                }
            }
        } else {
            sb.append("- Đang cập nhật giá và chi tiết phiên bản.\n");
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

    // Các class DTO bổ trợ
    public static class VectorDocument {
        private Long id;
        private String name;
        private String text;
        private List<Float> vector;

        public VectorDocument() {}

        public VectorDocument(Long id, String name, String text, List<Float> vector) {
            this.id = id;
            this.name = name;
            this.text = text;
            this.vector = vector;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public List<Float> getVector() { return vector; }
        public void setVector(List<Float> vector) { this.vector = vector; }
    }

    private static class SearchResult {
        VectorDocument doc;
        double score;

        public SearchResult(VectorDocument doc, double score) {
            this.doc = doc;
            this.score = score;
        }
    }
}

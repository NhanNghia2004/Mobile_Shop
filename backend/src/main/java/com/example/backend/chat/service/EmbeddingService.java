package com.example.backend.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String EMBEDDING_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent";

    public float[] getEmbedding(String text) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return null;
        }

        try {
            String url = EMBEDDING_API_URL + "?key=" + geminiApiKey.trim();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", text);

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", Collections.singletonList(textPart));

            Map<String, Object> body = new HashMap<>();
            body.put("model", "models/text-embedding-004");
            body.put("content", contentMap);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("embedding")) {
                Map<String, Object> embeddingMap = (Map<String, Object>) responseBody.get("embedding");
                List<Double> values = (List<Double>) embeddingMap.get("values");
                float[] embedding = new float[values.size()];
                for (int i = 0; i < values.size(); i++) {
                    embedding[i] = values.get(i).floatValue();
                }
                return embedding;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}

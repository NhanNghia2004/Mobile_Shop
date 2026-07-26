package com.example.backend.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public String getChatCompletion(String systemPrompt, String userMessage) {
        if (groqApiKey == null || groqApiKey.trim().isEmpty() || groqApiKey.contains("gsk_placeholder")) {
            return "Xin lỗi, hệ thống chưa cấu hình GROQ_API_KEY. Vui lòng cập nhật API key để sử dụng AI.";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + groqApiKey.trim());

            List<Map<String, String>> messages = new ArrayList<>();
            
            Map<String, String> sysMsg = new HashMap<>();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);

            Map<String, String> usrMsg = new HashMap<>();
            usrMsg.put("role", "user");
            usrMsg.put("content", userMessage);
            messages.add(usrMsg);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "llama-3.1-8b-instant");
            body.put("messages", messages);
            body.put("temperature", 0.3);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, requestEntity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> messageMap = (Map<String, Object>) choices.get(0).get("message");
                    return (String) messageMap.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi khi kết nối với máy chủ AI của Groq: " + e.getMessage();
        }
        return "Xin lỗi, không nhận được câu trả lời từ AI.";
    }
}

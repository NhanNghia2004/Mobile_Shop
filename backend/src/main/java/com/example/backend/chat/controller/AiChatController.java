package com.example.backend.chat.controller;

import com.example.backend.chat.dto.ChatRequest;
import com.example.backend.chat.dto.ChatResponse;
import com.example.backend.chat.service.AiChatService;
import com.example.backend.chat.service.RateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/chat")
public class AiChatController {

    @Autowired
    private AiChatService aiChatService;

    @Autowired
    private RateLimitingService rateLimitingService;

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request, HttpServletRequest servletRequest) {
        String ipAddress = servletRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = servletRequest.getRemoteAddr();
        }

        if (!rateLimitingService.tryConsume(ipAddress)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ChatResponse("Bạn đã vượt quá giới hạn yêu cầu (tối đa 10 tin nhắn/phút). Vui lòng đợi một chút rồi thử lại!"));
        }

        String reply = aiChatService.getChatResponse(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}

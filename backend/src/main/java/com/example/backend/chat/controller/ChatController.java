package com.example.backend.chat.controller;

import com.example.backend.chat.dto.ChatRequest;
import com.example.backend.chat.dto.ChatResponse;
import com.example.backend.chat.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String reply = chatService.getChatResponse(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}

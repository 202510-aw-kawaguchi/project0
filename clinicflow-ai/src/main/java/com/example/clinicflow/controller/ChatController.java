package com.example.clinicflow.controller;

import com.example.clinicflow.chat.ChatRequest;
import com.example.clinicflow.chat.ChatResponse;
import com.example.clinicflow.chat.SupportAiService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final SupportAiService supportAiService;

    public ChatController(SupportAiService supportAiService) {
        this.supportAiService = supportAiService;
    }

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return supportAiService.reply(request.message());
    }
}
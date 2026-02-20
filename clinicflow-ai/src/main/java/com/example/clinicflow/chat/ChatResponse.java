package com.example.clinicflow.chat;

import java.util.List;

public record ChatResponse(
        String answer,
        String intent,
        List<String> suggestions
) {
}
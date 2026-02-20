package com.example.clinicflow.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank(message = "message is required")
        @Size(max = 1000, message = "message must be 1000 characters or less")
        String message
) {
}
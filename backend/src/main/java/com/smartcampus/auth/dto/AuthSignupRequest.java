package com.smartcampus.auth.dto;

public record AuthSignupRequest(
        String studentId,
        String name,
        String email,
        String password,
        String profilePhoto // Base64 or URL
) {
}
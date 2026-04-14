package com.smartcampus.auth.dto;

public record AuthLoginRequest(
        String username,
        String password
) {
}

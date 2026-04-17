package com.smartcampus.auth.dto;

public record AuthVerifyOtpRequest(
        String email,
        String otp
) {
}

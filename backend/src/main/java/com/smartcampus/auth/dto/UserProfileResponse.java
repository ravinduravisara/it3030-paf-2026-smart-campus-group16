package com.smartcampus.auth.dto;

public record UserProfileResponse(
	String id,
	String username,
	String email
) {
}

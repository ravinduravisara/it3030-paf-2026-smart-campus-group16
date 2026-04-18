package com.smartcampus.user.dto;

public record ProfileUpdateRequest(
		String username,
		String studentId,
		String profilePhoto) {
}

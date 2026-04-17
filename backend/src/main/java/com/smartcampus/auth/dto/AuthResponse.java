package com.smartcampus.auth.dto;

public record AuthResponse(
	String token,
	String username,
	String role,
	String email,
	String name
) {
	public AuthResponse(String token, String username, String role) {
		this(token, username, role, username, username);
	}
}

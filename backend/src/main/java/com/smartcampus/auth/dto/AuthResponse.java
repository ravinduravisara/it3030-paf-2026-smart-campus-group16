package com.smartcampus.auth.dto;

public record AuthResponse(
	String token,
	String id,
	String username,
	String role,
	String email,
	String name,
	String message
) {
	public AuthResponse(String token, String username, String role) {
		this(token, null, username, role, username, username, null);
	}

	public AuthResponse(String token, String username, String role, String email, String name) {
		this(token, null, username, role, email, name, null);
	}
}

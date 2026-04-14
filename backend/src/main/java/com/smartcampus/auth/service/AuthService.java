package com.smartcampus.auth.service;

import java.util.Map;
import java.util.Objects;

import com.smartcampus.auth.dto.AuthLoginRequest;
import com.smartcampus.auth.dto.AuthResponse;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
	private static final Map<String, TempAccount> TEMP_ACCOUNTS = Map.of(
			"admin", new TempAccount("admin", "admin123", "ADMIN"),
			"user", new TempAccount("user", "user123", "USER")
	);

	public AuthResponse login(AuthLoginRequest request) {
		if (request == null || request.username() == null || request.password() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
		}

		String username = request.username().trim().toLowerCase();
		TempAccount account = TEMP_ACCOUNTS.get(username);
		if (account == null || !Objects.equals(account.password(), request.password())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
		}

		String token = "temp-" + account.role().toLowerCase() + "-" + System.currentTimeMillis();
		return new AuthResponse(token, account.username(), account.role());
	}

	private record TempAccount(String username, String password, String role) {
	}
}

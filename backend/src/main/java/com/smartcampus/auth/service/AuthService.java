package com.smartcampus.auth.service;

import java.util.Map;
import java.util.Objects;

import com.smartcampus.auth.dto.AuthLoginRequest;
import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.dto.AuthSignupRequest;
import com.smartcampus.user.model.User;
import com.smartcampus.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
	private final UserRepository userRepository;

	public AuthService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

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

	public AuthResponse signup(AuthSignupRequest request) {
		if (request == null || request.studentId() == null || request.name() == null || request.email() == null || request.password() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId, name, email, and password are required");
		}

		User user = new User();
		user.setStudentId(request.studentId());
		user.setUsername(request.name());
		user.setEmail(request.email());
		user.setPassword(request.password()); // In real app, hash the password
		user.setRole("USER");
		user.setProfilePhoto(request.profilePhoto());
		userRepository.save(user);

		String token = "signup-" + System.currentTimeMillis();
		return new AuthResponse(token, request.email(), "USER");
	}

	private record TempAccount(String username, String password, String role) {
	}
}

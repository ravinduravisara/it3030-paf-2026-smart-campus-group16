package com.smartcampus.auth.service;

import java.util.Map;
import java.util.Objects;

import com.smartcampus.auth.dto.AuthLoginRequest;
import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.dto.AuthSignupRequest;
import com.smartcampus.config.JwtUtil;
import com.smartcampus.user.model.User;
import com.smartcampus.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
	private final UserRepository userRepository;
	private final JwtUtil jwtUtil;

	public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
		this.userRepository = userRepository;
		this.jwtUtil = jwtUtil;
	}

	private static final Map<String, TempAccount> TEMP_ACCOUNTS = Map.of(
			"admin", new TempAccount("admin", "admin123", "ADMIN"),
			"user", new TempAccount("user", "user123", "USER")
	);

	public AuthResponse login(AuthLoginRequest request) {
		if (request == null || request.username() == null || request.password() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
		}

		String identifier = request.username().trim();
		String normalizedIdentifier = identifier.toLowerCase();
		String password = request.password();

		TempAccount account = TEMP_ACCOUNTS.get(normalizedIdentifier);
		if (account != null && Objects.equals(account.password(), password)) {
			String token = jwtUtil.generateToken(account.username(), account.role());
			return new AuthResponse(token, account.username(), account.role(), account.username(), account.username());
		}

		User user = userRepository.findByEmailIgnoreCase(identifier);
		if (user == null) {
			user = userRepository.findByStudentIdIgnoreCase(identifier);
		}
		if (user == null) {
			user = userRepository.findByUsernameIgnoreCase(identifier);
		}

		if (user == null || !Objects.equals(user.getPassword(), password)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
		}

		String role = user.getRole() == null || user.getRole().isBlank() ? "USER" : user.getRole();
		String subject = user.getEmail() != null && !user.getEmail().isBlank() ? user.getEmail() : user.getUsername();
		String displayName = user.getUsername() != null && !user.getUsername().isBlank() ? user.getUsername() : subject;
		String token = jwtUtil.generateToken(subject, role);
		return new AuthResponse(token, displayName, role, subject, displayName);
	}

	public AuthResponse signup(AuthSignupRequest request) {
		if (request == null || request.studentId() == null || request.name() == null || request.email() == null || request.password() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId, name, email, and password are required");
		}

		String studentId = request.studentId().trim();
		String name = request.name().trim();
		String email = request.email().trim();
		String password = request.password().trim();

		if (studentId.isBlank() || name.isBlank() || email.isBlank() || password.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId, name, email, and password are required");
		}

		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
		}

		if (userRepository.existsByStudentIdIgnoreCase(studentId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this student ID already exists");
		}

		User user = new User();
		user.setStudentId(studentId);
		user.setUsername(name);
		user.setEmail(email);
		user.setPassword(password);
		user.setRole("USER");
		user.setProfilePhoto(request.profilePhoto());
		userRepository.save(user);

		String token = jwtUtil.generateToken(email, "USER");
		return new AuthResponse(token, name, "USER", email, name);
	}

	public AuthResponse oauth2Login(String email, String name, String picture) {
		User user = userRepository.findByEmail(email);
		if (user == null) {
			user = new User();
			user.setEmail(email);
			user.setUsername(name);
			user.setRole("USER");
			user.setProfilePhoto(picture);
			userRepository.save(user);
		}

		String role = user.getRole() == null || user.getRole().isBlank() ? "USER" : user.getRole();
		String displayName = user.getUsername() != null && !user.getUsername().isBlank() ? user.getUsername() : email;
		String token = jwtUtil.generateToken(user.getEmail(), role);
		return new AuthResponse(token, displayName, role, user.getEmail(), displayName);
	}

	public AuthResponse devGoogleLogin() {
		return oauth2Login("google.user@campus.edu", "Google User", null);
	}

	private record TempAccount(String username, String password, String role) {
	}
}

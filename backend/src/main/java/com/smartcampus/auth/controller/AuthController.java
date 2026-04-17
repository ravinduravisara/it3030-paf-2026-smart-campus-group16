package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.AuthLoginRequest;
import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.dto.AuthSignupRequest;
import com.smartcampus.auth.service.AuthService;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final AuthService authService;
	private final String frontendUrl;

	public AuthController(AuthService authService,
			@Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
		this.authService = authService;
		this.frontendUrl = frontendUrl != null && frontendUrl.endsWith("/")
				? frontendUrl.substring(0, frontendUrl.length() - 1)
				: frontendUrl;
	}

	@PostMapping("/login")
	public AuthResponse login(@RequestBody AuthLoginRequest request) {
		return authService.login(request);
	}

	@PostMapping("/signup")
	public AuthResponse signup(@RequestBody AuthSignupRequest request) {
		return authService.signup(request);
	}

	@GetMapping("/google/dev")
	public void googleDevLogin(HttpServletResponse response) throws IOException {
		AuthResponse authResponse = authService.devGoogleLogin();
		String redirectUrl = String.format(
				"%s/#login?oauth=success&token=%s&email=%s&role=%s",
				frontendUrl,
				URLEncoder.encode(authResponse.token(), StandardCharsets.UTF_8),
				URLEncoder.encode(authResponse.username(), StandardCharsets.UTF_8),
				URLEncoder.encode(authResponse.role(), StandardCharsets.UTF_8)
		);
		response.sendRedirect(redirectUrl);
	}
}

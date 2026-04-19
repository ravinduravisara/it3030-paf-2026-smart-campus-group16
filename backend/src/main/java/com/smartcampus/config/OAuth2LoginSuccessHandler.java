package com.smartcampus.config;

import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.service.AuthService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final AuthService authService;
    private final String frontendUrl;

	public OAuth2LoginSuccessHandler(
            AuthService authService,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
		this.authService = authService;
        this.frontendUrl = frontendUrl != null && frontendUrl.endsWith("/")
                ? frontendUrl.substring(0, frontendUrl.length() - 1)
                : frontendUrl;
	}

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
		OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
		String email = oauth2User.getAttribute("email");
		String name = oauth2User.getAttribute("name");
		String picture = oauth2User.getAttribute("picture");

		// Get JWT token from auth service
		AuthResponse authResponse = authService.oauth2Login(email, name, picture);

		// Set cookies instead of URL parameters
		Cookie tokenCookie = new Cookie("sc.accessToken", authResponse.token());
		tokenCookie.setPath("/");
		tokenCookie.setHttpOnly(false);
		tokenCookie.setMaxAge(86400); // 24 hours
		response.addCookie(tokenCookie);

		// Store user info in a separate cookie (not httpOnly so JS can read it)
		String userJson = String.format(
				"{\"name\":\"%s\",\"username\":\"%s\",\"email\":\"%s\",\"role\":\"%s\"}",
				escapeJsonString(authResponse.name()),
				escapeJsonString(authResponse.username()),
				escapeJsonString(authResponse.email()),
				escapeJsonString(authResponse.role())
		);
		userJson = java.net.URLEncoder.encode(userJson, StandardCharsets.UTF_8);
		Cookie userCookie = new Cookie("sc.user", userJson);
		userCookie.setPath("/");
		userCookie.setMaxAge(86400); // 24 hours
		response.addCookie(userCookie);

		String redirectUrl = String.format(
				"%s/#login?oauth=success&token=%s&email=%s&name=%s&role=%s",
				frontendUrl,
				java.net.URLEncoder.encode(authResponse.token(), StandardCharsets.UTF_8),
				java.net.URLEncoder.encode(authResponse.email(), StandardCharsets.UTF_8),
				java.net.URLEncoder.encode(authResponse.name(), StandardCharsets.UTF_8),
				java.net.URLEncoder.encode(authResponse.role(), StandardCharsets.UTF_8)
		);

		setDefaultTargetUrl(redirectUrl);
		super.onAuthenticationSuccess(request, response, authentication);
	}

	private String escapeJsonString(String value) {
		if (value == null) return "";
		return value.replace("\\", "\\\\").replace("\"", "\\\"");
	}
}

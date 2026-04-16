package com.smartcampus.config;

import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.service.AuthService;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final AuthService authService;

	public OAuth2LoginSuccessHandler(AuthService authService) {
		this.authService = authService;
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
		tokenCookie.setHttpOnly(true);
		tokenCookie.setMaxAge(86400); // 24 hours
		response.addCookie(tokenCookie);

		// Store user info in a separate cookie (not httpOnly so JS can read it)
		String userJson = "{\"email\":\"" + authResponse.username() + "\",\"role\":\"" + authResponse.role() + "\"}";
		Cookie userCookie = new Cookie("sc.user", java.net.URLEncoder.encode(userJson, "UTF-8"));
		userCookie.setPath("/");
		userCookie.setMaxAge(86400); // 24 hours
		response.addCookie(userCookie);

		// Redirect to frontend home
		setDefaultTargetUrl("http://localhost:5176/#home");
		super.onAuthenticationSuccess(request, response, authentication);
	}
}

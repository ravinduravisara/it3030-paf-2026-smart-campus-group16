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

		// Set token cookie
		Cookie tokenCookie = new Cookie("sc.accessToken", authResponse.token());
		tokenCookie.setPath("/");
		tokenCookie.setHttpOnly(false);
		tokenCookie.setMaxAge(86400); // 24 hours
		response.addCookie(tokenCookie);

		// Build redirect URL with all user info as query params
		// Use URI-safe encoding (replace + with %20 for proper decoding in JS)
		String redirectUrl = String.format(
				"%s/#login?oauth=success&token=%s&id=%s&email=%s&name=%s&role=%s",
				frontendUrl,
				encode(authResponse.token()),
				encode(authResponse.id() != null ? authResponse.id() : ""),
				encode(authResponse.email()),
				encode(authResponse.name()),
				encode(authResponse.role())
		);

		getRedirectStrategy().sendRedirect(request, response, redirectUrl);
	}

	private static String encode(String value) {
		return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
	}
}

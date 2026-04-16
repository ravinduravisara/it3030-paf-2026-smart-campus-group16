package com.smartcampus.config;

import com.smartcampus.user.model.User;
import com.smartcampus.user.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final UserRepository userRepository;

	public OAuth2LoginSuccessHandler(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
		OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
		String email = oauth2User.getAttribute("email");
		String name = oauth2User.getAttribute("name");
		String picture = oauth2User.getAttribute("picture");

		// Save or update user
		User user = userRepository.findByEmail(email);
		if (user == null) {
			user = new User();
			user.setEmail(email);
			user.setUsername(name);
			user.setRole("USER");
			user.setProfilePhoto(picture);
			userRepository.save(user);
		}

		// Here you can set session or JWT
		setDefaultTargetUrl("http://localhost:5173/#home"); // Assuming frontend runs on 5173
		super.onAuthenticationSuccess(request, response, authentication);
	}
}

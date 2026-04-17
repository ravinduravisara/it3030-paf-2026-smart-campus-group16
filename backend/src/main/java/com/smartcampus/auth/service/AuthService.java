package com.smartcampus.auth.service;

import java.security.SecureRandom;
import java.util.Objects;

import com.smartcampus.auth.dto.AuthLoginRequest;
import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.dto.AuthSignupRequest;
import com.smartcampus.auth.dto.AuthVerifyOtpRequest;
import com.smartcampus.auth.dto.ResendOtpRequest;
import com.smartcampus.config.JwtUtil;
import com.smartcampus.user.model.User;
import com.smartcampus.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
	private static final SecureRandom RANDOM = new SecureRandom();
	private static final long OTP_TTL_MILLIS = 10 * 60 * 1000L;

	private final UserRepository userRepository;
	private final JwtUtil jwtUtil;
	private final OtpDeliveryService otpDeliveryService;
    private final String adminUsername;
    private final String adminPassword;

	public AuthService(
			UserRepository userRepository,
			JwtUtil jwtUtil,
			OtpDeliveryService otpDeliveryService,
			@Value("${app.admin.username:admin}") String adminUsername,
			@Value("${app.admin.password:admin123}") String adminPassword) {
		this.userRepository = userRepository;
		this.jwtUtil = jwtUtil;
		this.otpDeliveryService = otpDeliveryService;
		this.adminUsername = adminUsername;
		this.adminPassword = adminPassword;
	}

	public AuthResponse login(AuthLoginRequest request) {
		if (request == null || request.username() == null || request.password() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
		}

		String identifier = request.username().trim();
		String normalizedIdentifier = identifier.toLowerCase();
		String password = request.password();

		if (normalizedIdentifier.equals(adminUsername.toLowerCase()) && Objects.equals(adminPassword, password)) {
			String token = jwtUtil.generateToken(adminUsername, "ADMIN");
			return new AuthResponse(token, adminUsername, "ADMIN", adminUsername, adminUsername, "Admin login successful.");
		}

		User user = findUserByIdentifier(identifier);
		if (user == null || !Objects.equals(user.getPassword(), password)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
		}

		if (!isVerified(user)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your account with the OTP sent after registration");
		}

		return buildAuthResponse(user, "Login successful.");
	}

	public AuthResponse signup(AuthSignupRequest request) {
		if (request == null || request.studentId() == null || request.name() == null || request.email() == null || request.password() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId, name, email, and password are required");
		}

		String studentId = request.studentId().trim();
		String name = request.name().trim();
		String email = request.email().trim().toLowerCase();
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
		user.setVerified(false);

		String otpMessage = issueOtpFor(user);
		return new AuthResponse(null, name, "USER", email, name, otpMessage);
	}

	public AuthResponse verifyOtp(AuthVerifyOtpRequest request) {
		if (request == null || request.email() == null || request.otp() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email and otp are required");
		}

		String email = request.email().trim().toLowerCase();
		String otp = request.otp().trim();
		User user = findUserByIdentifier(email);

		if (user == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found for that email address or student ID");
		}

		if (isVerified(user)) {
			return buildAuthResponse(user, "Account already verified.");
		}

		if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt() < System.currentTimeMillis()) {
			String otpMessage = issueOtpFor(user);
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, otpMessage + " The previous OTP expired, so a new one has been generated.");
		}

		if (!Objects.equals(user.getOtpCode(), otp)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid OTP code");
		}

		user.setVerified(true);
		user.setOtpCode(null);
		user.setOtpExpiresAt(null);
		userRepository.save(user);

		return buildAuthResponse(user, "OTP verified successfully. You are now signed in.");
	}

	public AuthResponse resendOtp(ResendOtpRequest request) {
		if (request == null || request.email() == null || request.email().trim().isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
		}

		String email = request.email().trim().toLowerCase();
		User user = findUserByIdentifier(email);
		if (user == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found for that email address or student ID");
		}

		if (isVerified(user)) {
			return new AuthResponse(null, displayNameFor(user), normalizedRole(user), email, displayNameFor(user), "This account is already verified.");
		}

		String otpMessage = issueOtpFor(user);
		return new AuthResponse(null, displayNameFor(user), normalizedRole(user), email, displayNameFor(user), otpMessage);
	}

	public AuthResponse oauth2Login(String email, String name, String picture) {
		User user = userRepository.findByEmailIgnoreCase(email);
		if (user == null) {
			user = new User();
			user.setEmail(email);
			user.setUsername(name);
			user.setRole("USER");
			user.setProfilePhoto(picture);
			user.setVerified(true);
			userRepository.save(user);
		} else if (user.getVerified() == null) {
			user.setVerified(true);
			userRepository.save(user);
		}

		return buildAuthResponse(user, "Login successful.");
	}

	public AuthResponse devGoogleLogin() {
		return oauth2Login("google.user@campus.edu", "Google User", null);
	}

	private User findUserByIdentifier(String identifier) {
		User user = userRepository.findByEmailIgnoreCase(identifier);
		if (user == null) {
			user = userRepository.findByStudentIdIgnoreCase(identifier);
		}
		if (user == null) {
			user = userRepository.findByUsernameIgnoreCase(identifier);
		}
		return user;
	}

	private boolean isVerified(User user) {
		return !Boolean.FALSE.equals(user.getVerified());
	}

	private String normalizedRole(User user) {
		return user.getRole() == null || user.getRole().isBlank() ? "USER" : user.getRole();
	}

	private String displayNameFor(User user) {
		String email = user.getEmail() != null ? user.getEmail() : user.getUsername();
		return user.getUsername() != null && !user.getUsername().isBlank() ? user.getUsername() : email;
	}

	private AuthResponse buildAuthResponse(User user, String message) {
		String role = normalizedRole(user);
		String subject = user.getEmail() != null && !user.getEmail().isBlank() ? user.getEmail() : user.getUsername();
		String displayName = displayNameFor(user);
		String token = jwtUtil.generateToken(subject, role);
		return new AuthResponse(token, displayName, role, subject, displayName, message);
	}

	private String issueOtpFor(User user) {
		String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
		user.setOtpCode(otp);
		user.setOtpExpiresAt(System.currentTimeMillis() + OTP_TTL_MILLIS);
		user.setVerified(false);
		userRepository.save(user);
		return otpDeliveryService.sendOtp(user.getEmail(), displayNameFor(user), otp);
	}

}

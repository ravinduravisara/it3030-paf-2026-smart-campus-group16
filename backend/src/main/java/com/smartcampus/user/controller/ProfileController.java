package com.smartcampus.user.controller;

import java.security.Principal;
import java.util.Map;

import com.smartcampus.user.dto.ProfileUpdateRequest;
import com.smartcampus.user.model.User;
import com.smartcampus.user.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
	private final UserService userService;

	public ProfileController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/me")
	public ResponseEntity<Map<String, Object>> getMe(Principal principal) {
		User user = userService.findByEmail(principal.getName());
		return ResponseEntity.ok(Map.of(
				"id", user.getId(),
				"studentId", user.getStudentId() != null ? user.getStudentId() : "",
				"name", user.getUsername() != null ? user.getUsername() : "",
				"email", user.getEmail(),
				"role", user.getRole() != null ? user.getRole() : "USER",
				"profilePhoto", user.getProfilePhoto() != null ? user.getProfilePhoto() : ""));
	}

	@PutMapping("/me")
	public ResponseEntity<Map<String, Object>> updateMe(Principal principal,
			@RequestBody ProfileUpdateRequest request) {
		User updated = userService.updateProfile(principal.getName(), request);
		return ResponseEntity.ok(Map.of(
				"id", updated.getId(),
				"studentId", updated.getStudentId() != null ? updated.getStudentId() : "",
				"name", updated.getUsername() != null ? updated.getUsername() : "",
				"email", updated.getEmail(),
				"role", updated.getRole() != null ? updated.getRole() : "USER",
				"profilePhoto", updated.getProfilePhoto() != null ? updated.getProfilePhoto() : ""));
	}

	@DeleteMapping("/me")
	public ResponseEntity<Void> deleteMe(Principal principal) {
		userService.deleteByEmail(principal.getName());
		return ResponseEntity.noContent().build();
	}
}

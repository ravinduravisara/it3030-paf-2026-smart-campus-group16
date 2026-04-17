package com.smartcampus.user.controller;

import java.util.List;
import java.util.Map;

import com.smartcampus.user.model.User;
import com.smartcampus.user.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public List<User> list() {
		return userService.listUsers();
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		userService.deleteUser(id);
		return ResponseEntity.noContent().build();
	}

	@PutMapping("/{id}/role")
	public User updateRole(@PathVariable String id, @RequestBody Map<String, String> body) {
		String role = body.getOrDefault("role", "USER");
		return userService.updateRole(id, role);
	}

	@PatchMapping("/{id}/block")
	public User toggleBlock(@PathVariable String id) {
		return userService.toggleBlock(id);
	}
}

package com.smartcampus.user.service;

import java.util.List;

import com.smartcampus.user.dto.ProfileUpdateRequest;
import com.smartcampus.user.model.User;
import com.smartcampus.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public List<User> listUsers() {
		return userRepository.findAll();
	}

	public void deleteUser(String id) {
		if (!userRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		userRepository.deleteById(id);
	}

	public User updateRole(String id, String role) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		user.setRole(role);
		return userRepository.save(user);
	}

	public User toggleBlock(String id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		user.setBlocked(user.getBlocked() == null || !user.getBlocked());
		return userRepository.save(user);
	}

	public User findByEmail(String email) {
		User user = userRepository.findByEmailIgnoreCase(email);
		if (user == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return user;
	}

	public User updateProfile(String email, ProfileUpdateRequest request) {
		User user = findByEmail(email);
		if (request.username() != null) {
			user.setUsername(request.username().trim());
		}
		if (request.studentId() != null) {
			user.setStudentId(request.studentId().trim());
		}
		if (request.profilePhoto() != null) {
			user.setProfilePhoto(request.profilePhoto());
		}
		return userRepository.save(user);
	}

	public void deleteByEmail(String email) {
		User user = findByEmail(email);
		userRepository.deleteById(user.getId());
	}
}

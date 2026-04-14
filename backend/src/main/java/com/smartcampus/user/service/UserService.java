package com.smartcampus.user.service;

import java.util.List;

import com.smartcampus.user.model.User;
import com.smartcampus.user.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class UserService {
	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public List<User> listUsers() {
		return userRepository.findAll();
	}
}

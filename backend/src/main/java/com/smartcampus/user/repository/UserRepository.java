package com.smartcampus.user.repository;

import com.smartcampus.user.model.User;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
	User findByEmail(String email);
	User findByEmailIgnoreCase(String email);
	User findByStudentIdIgnoreCase(String studentId);
	User findByUsernameIgnoreCase(String username);
	boolean existsByEmailIgnoreCase(String email);
	boolean existsByStudentIdIgnoreCase(String studentId);
}

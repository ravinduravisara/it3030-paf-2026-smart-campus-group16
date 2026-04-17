package com.smartcampus.comment.repository;

import java.util.List;

import com.smartcampus.comment.model.Comment;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommentRepository extends MongoRepository<Comment, String> {
	List<Comment> findByTicketIdOrderByCreatedAtDesc(String ticketId);
}

package com.smartcampus.comment.controller;

import java.util.List;
import java.util.Map;

import com.smartcampus.comment.model.Comment;
import com.smartcampus.comment.service.CommentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
	private final CommentService commentService;

	public CommentController(CommentService commentService) {
		this.commentService = commentService;
	}

	@PostMapping
	public ResponseEntity<Comment> addComment(@RequestBody Map<String, String> body) {
		String ticketId = body.get("ticketId");
		String createdBy = body.get("createdBy");
		String text = body.get("text");
		return ResponseEntity.ok(commentService.addComment(ticketId, createdBy, text));
	}

	@GetMapping("/ticket/{ticketId}")
	public List<Comment> getByTicket(@PathVariable String ticketId) {
		return commentService.getCommentsByTicketId(ticketId);
	}
}

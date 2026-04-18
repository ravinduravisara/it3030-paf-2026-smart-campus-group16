package com.smartcampus.comment.controller;

import java.util.List;

import com.smartcampus.comment.dto.CommentCreateRequest;
import com.smartcampus.comment.dto.CommentResponse;
import com.smartcampus.comment.dto.CommentUpdateRequest;
import com.smartcampus.comment.service.CommentService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class CommentController {
	private final CommentService commentService;

	public CommentController(CommentService commentService) {
		this.commentService = commentService;
	}

	@GetMapping("/{ticketId}/comments")
	public List<CommentResponse> listComments(@PathVariable String ticketId) {
		return commentService.listByTicket(ticketId);
	}

	@PostMapping("/{ticketId}/comments")
	public ResponseEntity<CommentResponse> addComment(@PathVariable String ticketId,
													  @Valid @RequestBody CommentCreateRequest request,
													  Authentication auth) {
		return ResponseEntity.ok(commentService.addComment(ticketId, request, auth.getName()));
	}

	@PutMapping("/{ticketId}/comments/{commentId}")
	public ResponseEntity<CommentResponse> updateComment(@PathVariable String ticketId,
														 @PathVariable String commentId,
														 @Valid @RequestBody CommentUpdateRequest request,
														 Authentication auth) {
		boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
		return ResponseEntity.ok(commentService.updateComment(commentId, request, auth.getName(), isAdmin));
	}

	@DeleteMapping("/{ticketId}/comments/{commentId}")
	public ResponseEntity<Void> deleteComment(@PathVariable String ticketId,
											  @PathVariable String commentId,
											  Authentication auth) {
		boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
		commentService.deleteComment(commentId, auth.getName(), isAdmin);
		return ResponseEntity.noContent().build();
	}
}

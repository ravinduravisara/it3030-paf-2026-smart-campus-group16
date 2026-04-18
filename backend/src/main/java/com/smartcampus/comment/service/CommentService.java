package com.smartcampus.comment.service;

import java.time.Instant;
import java.util.List;

import com.smartcampus.comment.dto.CommentCreateRequest;
import com.smartcampus.comment.dto.CommentResponse;
import com.smartcampus.comment.dto.CommentUpdateRequest;
import com.smartcampus.comment.model.Comment;
import com.smartcampus.comment.repository.CommentRepository;
import com.smartcampus.notification.service.NotificationService;
import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.repository.TicketRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CommentService {
	private final CommentRepository commentRepository;
	private final TicketRepository ticketRepository;
	private final NotificationService notificationService;

	public CommentService(CommentRepository commentRepository, TicketRepository ticketRepository,
						  NotificationService notificationService) {
		this.commentRepository = commentRepository;
		this.ticketRepository = ticketRepository;
		this.notificationService = notificationService;
	}

	public List<CommentResponse> listByTicket(String ticketId) {
		return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
				.stream().map(CommentService::toResponse).toList();
	}

	public CommentResponse addComment(String ticketId, CommentCreateRequest request, String username) {
		Ticket ticket = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

		String text = request.text().trim();
		if (text.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment text cannot be blank");
		}
		if (text.length() > 1000) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment must not exceed 1000 characters");
		}

		// Record first response time if commenter is not the ticket creator
		if (ticket.getFirstResponseAt() == null && !username.equals(ticket.getCreatedBy())) {
			ticket.setFirstResponseAt(Instant.now());
			ticket.setUpdatedAt(Instant.now());
			ticketRepository.save(ticket);
		}

		Comment comment = new Comment();
		comment.setTicketId(ticketId);
		comment.setAuthorUsername(username);
		comment.setText(text);
		Comment saved = commentRepository.save(comment);

		// Notify ticket creator about the new comment (if commenter is someone else)
		if (!username.equals(ticket.getCreatedBy())) {
			notificationService.sendToUser(
				ticket.getCreatedBy(),
				"New comment on your ticket",
				username + " commented on your ticket \"" + ticket.getTitle() + "\": " + (text.length() > 100 ? text.substring(0, 100) + "..." : text),
				"COMMENT"
			);
		}

		return toResponse(saved);
	}

	public CommentResponse updateComment(String commentId, CommentUpdateRequest request, String username, boolean isAdmin) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

		if (!isAdmin && !comment.getAuthorUsername().equals(username)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own comments");
		}

		String text = request.text().trim();
		if (text.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment text cannot be blank");
		}
		if (text.length() > 1000) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment must not exceed 1000 characters");
		}

		comment.setText(text);
		comment.setUpdatedAt(Instant.now());
		return toResponse(commentRepository.save(comment));
	}

	public void deleteComment(String commentId, String username, boolean isAdmin) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

		if (!isAdmin && !comment.getAuthorUsername().equals(username)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
		}

		commentRepository.delete(comment);
	}

	private static CommentResponse toResponse(Comment c) {
		return new CommentResponse(
				c.getId(),
				c.getTicketId(),
				c.getAuthorUsername(),
				c.getText(),
				c.getCreatedAt(),
				c.getUpdatedAt()
		);
	}
}

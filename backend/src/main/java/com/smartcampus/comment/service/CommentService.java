package com.smartcampus.comment.service;

import java.time.Instant;
import java.util.List;

import com.smartcampus.comment.dto.CommentCreateRequest;
import com.smartcampus.comment.dto.CommentResponse;
import com.smartcampus.comment.dto.CommentUpdateRequest;
import com.smartcampus.comment.model.Comment;
import com.smartcampus.comment.repository.CommentRepository;
import com.smartcampus.ticket.repository.TicketRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CommentService {
	private final CommentRepository commentRepository;
	private final TicketRepository ticketRepository;

	public CommentService(CommentRepository commentRepository, TicketRepository ticketRepository) {
		this.commentRepository = commentRepository;
		this.ticketRepository = ticketRepository;
	}

	public List<CommentResponse> listByTicket(String ticketId) {
		return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
				.stream().map(CommentService::toResponse).toList();
	}

	public CommentResponse addComment(String ticketId, CommentCreateRequest request, String username) {
		ticketRepository.findById(ticketId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

		Comment comment = new Comment();
		comment.setTicketId(ticketId);
		comment.setAuthorUsername(username);
		comment.setText(request.text());
		return toResponse(commentRepository.save(comment));
	}

	public CommentResponse updateComment(String commentId, CommentUpdateRequest request, String username, boolean isAdmin) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

		if (!isAdmin && !comment.getAuthorUsername().equals(username)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own comments");
		}

		comment.setText(request.text());
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

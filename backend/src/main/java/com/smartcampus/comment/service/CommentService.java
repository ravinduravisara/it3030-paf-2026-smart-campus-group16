package com.smartcampus.comment.service;

import java.util.List;

import com.smartcampus.comment.model.Comment;
import com.smartcampus.comment.repository.CommentRepository;
import com.smartcampus.notification.model.NotificationType;
import com.smartcampus.notification.service.NotificationService;
import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.repository.TicketRepository;

import org.springframework.stereotype.Service;

@Service
public class CommentService {
	private final CommentRepository commentRepository;
	private final TicketRepository ticketRepository;
	private final NotificationService notificationService;

	public CommentService(CommentRepository commentRepository, TicketRepository ticketRepository, NotificationService notificationService) {
		this.commentRepository = commentRepository;
		this.ticketRepository = ticketRepository;
		this.notificationService = notificationService;
	}

	public Comment addComment(String ticketId, String createdBy, String text) {
		Comment comment = new Comment();
		comment.setTicketId(ticketId);
		comment.setCreatedBy(createdBy);
		comment.setText(text);
		Comment saved = commentRepository.save(comment);

		Ticket ticket = ticketRepository.findById(ticketId).orElse(null);
		if (ticket != null && !ticket.getCreatedBy().equals(createdBy)) {
			notificationService.createNotification(
					ticket.getCreatedBy(),
					null,
					"New comment on your ticket \"" + ticket.getTitle() + "\": " + text,
					NotificationType.COMMENT
			);
		}

		return saved;
	}

	public List<Comment> getCommentsByTicketId(String ticketId) {
		return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
	}
}

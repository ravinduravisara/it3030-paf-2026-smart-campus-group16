package com.smartcampus.ticket.service;

import java.util.List;

import com.smartcampus.notification.model.NotificationType;
import com.smartcampus.notification.service.NotificationService;
import com.smartcampus.ticket.dto.TicketCreateRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;
import com.smartcampus.ticket.repository.TicketRepository;

import org.springframework.stereotype.Service;

@Service
public class TicketService {
	private final TicketRepository ticketRepository;
	private final NotificationService notificationService;

	public TicketService(TicketRepository ticketRepository, NotificationService notificationService) {
		this.ticketRepository = ticketRepository;
		this.notificationService = notificationService;
	}

	public List<TicketResponse> listTickets() {
		return ticketRepository.findAll().stream().map(TicketService::toResponse).toList();
	}

	public TicketResponse getTicket(String id) {
		return ticketRepository.findById(id).map(TicketService::toResponse).orElse(null);
	}

	public TicketResponse createTicket(TicketCreateRequest request) {
		Ticket ticket = new Ticket();
		ticket.setTitle(request.title());
		ticket.setDescription(request.description());
		ticket.setCreatedBy(request.createdBy());
		ticket.setPriority(request.priority() == null ? TicketPriority.MEDIUM : request.priority());
		ticket.setStatus(TicketStatus.OPEN);
		return toResponse(ticketRepository.save(ticket));
	}

	public TicketResponse updateTicketStatus(String id, TicketStatus newStatus) {
		Ticket ticket = ticketRepository.findById(id).orElse(null);
		if (ticket == null) {
			return null;
		}
		ticket.setStatus(newStatus);
		Ticket saved = ticketRepository.save(ticket);
		notificationService.createNotification(
				saved.getCreatedBy(),
				null,
				"Your ticket \"" + saved.getTitle() + "\" status changed to " + newStatus + ".",
				NotificationType.TICKET
		);
		return toResponse(saved);
	}

	private static TicketResponse toResponse(Ticket ticket) {
		return new TicketResponse(
				ticket.getId(),
				ticket.getTitle(),
				ticket.getDescription(),
				ticket.getCreatedBy(),
				ticket.getPriority(),
				ticket.getStatus()
		);
	}
}

package com.smartcampus.ticket.service;

import java.time.Instant;
import java.util.List;

import com.smartcampus.ticket.dto.TicketAssignRequest;
import com.smartcampus.ticket.dto.TicketCreateRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;
import com.smartcampus.ticket.repository.TicketRepository;
import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.repository.ResourceRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TicketService {
	private final TicketRepository ticketRepository;
	private final ResourceRepository resourceRepository;

	public TicketService(TicketRepository ticketRepository, ResourceRepository resourceRepository) {
		this.ticketRepository = ticketRepository;
		this.resourceRepository = resourceRepository;
	}

	public List<TicketResponse> listAllTickets() {
		return ticketRepository.findAll().stream().map(TicketService::toResponse).toList();
	}

	public List<TicketResponse> listMyTickets(String username) {
		return ticketRepository.findByCreatedBy(username).stream().map(TicketService::toResponse).toList();
	}

	public List<TicketResponse> listByStatus(TicketStatus status) {
		return ticketRepository.findByStatus(status).stream().map(TicketService::toResponse).toList();
	}

	public List<TicketResponse> listByPriority(TicketPriority priority) {
		return ticketRepository.findByPriority(priority).stream().map(TicketService::toResponse).toList();
	}

	public List<TicketResponse> listByCategory(String category) {
		return ticketRepository.findByCategory(category).stream().map(TicketService::toResponse).toList();
	}

	public List<TicketResponse> listByAssignee(String assignedTo) {
		return ticketRepository.findByAssignedTo(assignedTo).stream().map(TicketService::toResponse).toList();
	}

	public TicketResponse getTicket(String id) {
		return ticketRepository.findById(id).map(TicketService::toResponse).orElse(null);
	}

	public TicketResponse createTicket(TicketCreateRequest request, String username) {
		Ticket ticket = new Ticket();
		ticket.setTitle(request.title());
		ticket.setDescription(request.description());
		ticket.setCategory(request.category());
		ticket.setCreatedBy(username);
		ticket.setContactInfo(request.contactInfo());
		ticket.setPriority(request.priority() == null ? TicketPriority.MEDIUM : request.priority());
		ticket.setStatus(TicketStatus.OPEN);
		ticket.setLocation(request.location());

		if (request.resourceId() != null && !request.resourceId().isBlank()) {
			Resource resource = resourceRepository.findById(request.resourceId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
			ticket.setResourceId(resource.getId());
			ticket.setResourceName(resource.getName());
			if (ticket.getLocation() == null || ticket.getLocation().isBlank()) {
				ticket.setLocation(resource.getLocation());
			}
		}

		if (request.attachments() != null) {
			if (request.attachments().size() > 3) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 3 attachments allowed");
			}
			ticket.setAttachments(request.attachments());
		}

		return toResponse(ticketRepository.save(ticket));
	}

	public TicketResponse updateStatus(String id, TicketStatusUpdateRequest request, String username) {
		Ticket ticket = ticketRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

		TicketStatus newStatus = TicketStatus.valueOf(request.status().toUpperCase());
		validateStatusTransition(ticket.getStatus(), newStatus);

		if (newStatus == TicketStatus.REJECTED) {
			if (request.rejectionReason() == null || request.rejectionReason().isBlank()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
			}
			ticket.setRejectionReason(request.rejectionReason());
		}

		if (newStatus == TicketStatus.RESOLVED) {
			ticket.setResolutionNotes(request.resolutionNotes());
			ticket.setResolvedAt(Instant.now());
		}

		ticket.setStatus(newStatus);
		ticket.setUpdatedAt(Instant.now());
		return toResponse(ticketRepository.save(ticket));
	}

	public TicketResponse assignTicket(String id, TicketAssignRequest request) {
		Ticket ticket = ticketRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

		if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot assign a closed or rejected ticket");
		}

		ticket.setAssignedTo(request.assignedTo());
		if (ticket.getStatus() == TicketStatus.OPEN) {
			ticket.setStatus(TicketStatus.IN_PROGRESS);
		}
		ticket.setUpdatedAt(Instant.now());
		return toResponse(ticketRepository.save(ticket));
	}

	private void validateStatusTransition(TicketStatus current, TicketStatus next) {
		boolean valid = switch (current) {
			case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
			case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED || next == TicketStatus.OPEN;
			case RESOLVED -> next == TicketStatus.CLOSED || next == TicketStatus.IN_PROGRESS;
			case CLOSED, REJECTED -> false;
		};
		if (!valid) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Cannot transition from " + current + " to " + next);
		}
	}

	private static TicketResponse toResponse(Ticket t) {
		return new TicketResponse(
				t.getId(),
				t.getTitle(),
				t.getDescription(),
				t.getCategory(),
				t.getResourceId(),
				t.getResourceName(),
				t.getLocation(),
				t.getCreatedBy(),
				t.getContactInfo(),
				t.getPriority(),
				t.getStatus(),
				t.getAssignedTo(),
				t.getResolutionNotes(),
				t.getRejectionReason(),
				t.getAttachments(),
				t.getCreatedAt(),
				t.getUpdatedAt(),
				t.getResolvedAt()
		);
	}
}

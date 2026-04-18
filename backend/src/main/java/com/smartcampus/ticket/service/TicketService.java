package com.smartcampus.ticket.service;

import java.time.Duration;
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

	private static final java.util.Set<String> VALID_CATEGORIES = java.util.Set.of(
			"IT_EQUIPMENT", "ELECTRICAL", "PLUMBING", "HVAC", "FURNITURE", "CLEANING", "SECURITY", "OTHER");
	private static final long MAX_ATTACHMENT_SIZE = 5_242_880L; // 5 MB
	private static final java.util.Set<String> ALLOWED_CONTENT_TYPES = java.util.Set.of(
			"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml");

	public TicketResponse createTicket(TicketCreateRequest request, String username) {
		// Validate category against allowed values
		if (!VALID_CATEGORIES.contains(request.category())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Invalid category. Must be one of: " + String.join(", ", VALID_CATEGORIES));
		}

		Ticket ticket = new Ticket();
		ticket.setTitle(request.title().trim());
		ticket.setDescription(request.description().trim());
		ticket.setCategory(request.category());
		ticket.setCreatedBy(username);
		ticket.setContactInfo(request.contactInfo() != null ? request.contactInfo().trim() : null);
		ticket.setPriority(request.priority() == null ? TicketPriority.MEDIUM : request.priority());
		ticket.setStatus(TicketStatus.OPEN);
		ticket.setLocation(request.location() != null ? request.location().trim() : null);

		if (request.resourceId() != null && !request.resourceId().isBlank()) {
			Resource resource = resourceRepository.findById(request.resourceId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
			ticket.setResourceId(resource.getId());
			ticket.setResourceName(resource.getName());
			if (ticket.getLocation() == null || ticket.getLocation().isBlank()) {
				ticket.setLocation(resource.getLocation());
			}
		}

		if (request.attachments() != null && !request.attachments().isEmpty()) {
			if (request.attachments().size() > 3) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 3 attachments allowed");
			}
			for (int i = 0; i < request.attachments().size(); i++) {
				var att = request.attachments().get(i);
				if (att.getFileName() == null || att.getFileName().isBlank()) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
							"Attachment " + (i + 1) + ": file name is required");
				}
				if (att.getContentType() == null || !ALLOWED_CONTENT_TYPES.contains(att.getContentType())) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
							"Attachment " + (i + 1) + ": only image files are allowed (JPEG, PNG, GIF, WebP, BMP, SVG)");
				}
				if (att.getSize() <= 0) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
							"Attachment " + (i + 1) + ": file size must be positive");
				}
				if (att.getSize() > MAX_ATTACHMENT_SIZE) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
							"Attachment " + (i + 1) + ": file must not exceed 5 MB");
				}
				if (att.getBase64Data() == null || att.getBase64Data().isBlank()) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
							"Attachment " + (i + 1) + ": file data is required");
				}
			}
			ticket.setAttachments(request.attachments());
		}

		return toResponse(ticketRepository.save(ticket));
	}

	public TicketResponse updateStatus(String id, TicketStatusUpdateRequest request, String username) {
		Ticket ticket = ticketRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

		TicketStatus newStatus;
		try {
			newStatus = TicketStatus.valueOf(request.status().toUpperCase());
		} catch (IllegalArgumentException e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Invalid status value: " + request.status());
		}
		validateStatusTransition(ticket.getStatus(), newStatus);

		if (newStatus == TicketStatus.REJECTED) {
			if (request.rejectionReason() == null || request.rejectionReason().isBlank()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required when rejecting a ticket");
			}
			if (request.rejectionReason().trim().length() > 500) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason must not exceed 500 characters");
			}
			ticket.setRejectionReason(request.rejectionReason().trim());
		}

		if (newStatus == TicketStatus.RESOLVED) {
			if (request.resolutionNotes() != null && request.resolutionNotes().trim().length() > 2000) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resolution notes must not exceed 2000 characters");
			}
			ticket.setResolutionNotes(request.resolutionNotes() != null ? request.resolutionNotes().trim() : null);
			ticket.setResolvedAt(Instant.now());
		}

		if (ticket.getFirstResponseAt() == null && ticket.getStatus() == TicketStatus.OPEN) {
			ticket.setFirstResponseAt(Instant.now());
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
			if (ticket.getFirstResponseAt() == null) {
				ticket.setFirstResponseAt(Instant.now());
			}
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
		Long ttfrMs = null;
		if (t.getFirstResponseAt() != null && t.getCreatedAt() != null) {
			ttfrMs = Duration.between(t.getCreatedAt(), t.getFirstResponseAt()).toMillis();
		}
		Long ttrMs = null;
		if (t.getResolvedAt() != null && t.getCreatedAt() != null) {
			ttrMs = Duration.between(t.getCreatedAt(), t.getResolvedAt()).toMillis();
		}

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
				t.getResolvedAt(),
				t.getFirstResponseAt(),
				ttfrMs,
				ttrMs
		);
	}
}

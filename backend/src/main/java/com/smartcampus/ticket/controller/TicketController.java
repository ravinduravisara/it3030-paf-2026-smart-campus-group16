package com.smartcampus.ticket.controller;

import java.util.List;

import com.smartcampus.ticket.dto.TicketAssignRequest;
import com.smartcampus.ticket.dto.TicketCreateRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;
import com.smartcampus.ticket.service.TicketService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
	private final TicketService ticketService;

	public TicketController(TicketService ticketService) {
		this.ticketService = ticketService;
	}

	@GetMapping
	public List<TicketResponse> list(Authentication auth,
									 @RequestParam(required = false) String status,
									 @RequestParam(required = false) String priority,
									 @RequestParam(required = false) String category,
									 @RequestParam(required = false) String assignedTo) {
		boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

		if (isAdmin) {
			if (status != null && !status.isBlank()) {
				try {
					return ticketService.listByStatus(TicketStatus.valueOf(status.toUpperCase()));
				} catch (IllegalArgumentException e) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
				}
			}
			if (priority != null && !priority.isBlank()) {
				try {
					return ticketService.listByPriority(TicketPriority.valueOf(priority.toUpperCase()));
				} catch (IllegalArgumentException e) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid priority: " + priority);
				}
			}
			if (category != null && !category.isBlank()) {
				return ticketService.listByCategory(category);
			}
			if (assignedTo != null && !assignedTo.isBlank()) {
				return ticketService.listByAssignee(assignedTo);
			}
			return ticketService.listAllTickets();
		}

		return ticketService.listMyTickets(auth.getName());
	}

	@GetMapping("/{id}")
	public ResponseEntity<TicketResponse> get(@PathVariable String id) {
		TicketResponse ticket = ticketService.getTicket(id);
		if (ticket == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(ticket);
	}

	@PostMapping
	public ResponseEntity<TicketResponse> create(@Valid @RequestBody TicketCreateRequest request,
												 Authentication auth) {
		return ResponseEntity.ok(ticketService.createTicket(request, auth.getName()));
	}

	@PatchMapping("/{id}/status")
	public ResponseEntity<TicketResponse> updateStatus(@PathVariable String id,
													   @Valid @RequestBody TicketStatusUpdateRequest request,
													   Authentication auth) {
		return ResponseEntity.ok(ticketService.updateStatus(id, request, auth.getName()));
	}

	@PatchMapping("/{id}/assign")
	public ResponseEntity<TicketResponse> assign(@PathVariable String id,
												 @Valid @RequestBody TicketAssignRequest request) {
		return ResponseEntity.ok(ticketService.assignTicket(id, request));
	}
}

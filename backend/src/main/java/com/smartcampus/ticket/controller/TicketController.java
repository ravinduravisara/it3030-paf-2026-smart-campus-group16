package com.smartcampus.ticket.controller;

import java.util.List;

import com.smartcampus.ticket.dto.TicketCreateRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.service.TicketService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
	private final TicketService ticketService;

	public TicketController(TicketService ticketService) {
		this.ticketService = ticketService;
	}

	@GetMapping
	public List<TicketResponse> list() {
		return ticketService.listTickets();
	}

	@GetMapping("/{id}")
	public ResponseEntity<TicketResponse> get(@NonNull @PathVariable String id) {
		TicketResponse ticket = ticketService.getTicket(id);
		if (ticket == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(ticket);
	}

	@PostMapping
	public ResponseEntity<TicketResponse> create(@Valid @RequestBody TicketCreateRequest request) {
		return ResponseEntity.ok(ticketService.createTicket(request));
	}
}

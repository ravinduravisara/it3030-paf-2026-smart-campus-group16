package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.model.TicketPriority;

import jakarta.validation.constraints.NotBlank;

public record TicketCreateRequest(
		@NotBlank String title,
		String description,
		@NotBlank String createdBy,
		TicketPriority priority
) {
}

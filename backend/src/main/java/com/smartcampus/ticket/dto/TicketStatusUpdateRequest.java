package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.model.TicketStatus;

import jakarta.validation.constraints.NotNull;

public record TicketStatusUpdateRequest(
		@NotNull TicketStatus status
) {
}

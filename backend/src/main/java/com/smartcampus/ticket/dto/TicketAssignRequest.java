package com.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketAssignRequest(
		@NotBlank(message = "Assignee username is required")
		String assignedTo
) {
}

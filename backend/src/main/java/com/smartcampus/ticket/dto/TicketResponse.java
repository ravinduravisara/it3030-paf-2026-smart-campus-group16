package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;

public record TicketResponse(
		String id,
		String title,
		String description,
		String createdBy,
		TicketPriority priority,
		TicketStatus status
) {
}

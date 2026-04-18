package com.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TicketStatusUpdateRequest(
		@NotBlank(message = "Status is required")
		@Pattern(regexp = "(?i)OPEN|IN_PROGRESS|RESOLVED|CLOSED|REJECTED",
				message = "Status must be OPEN, IN_PROGRESS, RESOLVED, CLOSED, or REJECTED")
		String status,

		@Size(max = 2000, message = "Resolution notes must not exceed 2000 characters")
		String resolutionNotes,

		@Size(max = 500, message = "Rejection reason must not exceed 500 characters")
		String rejectionReason
) {
}

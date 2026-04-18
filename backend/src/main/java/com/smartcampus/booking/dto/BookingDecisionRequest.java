package com.smartcampus.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BookingDecisionRequest(
		@NotBlank(message = "Action is required")
		@Pattern(regexp = "(?i)APPROVE|REJECT", message = "Action must be APPROVE or REJECT")
		String action,

		@Size(max = 500, message = "Reason must not exceed 500 characters")
		String reason
) {
}

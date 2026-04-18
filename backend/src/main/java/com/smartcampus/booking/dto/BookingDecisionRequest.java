package com.smartcampus.booking.dto;

import jakarta.validation.constraints.NotBlank;

public record BookingDecisionRequest(
		@NotBlank String action,
		String reason
) {
}

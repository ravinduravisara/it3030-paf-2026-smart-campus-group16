package com.smartcampus.booking.dto;

import jakarta.validation.constraints.NotBlank;

public record BookingCreateRequest(
		@NotBlank String resourceId,
		@NotBlank String requestedBy
) {
}

package com.smartcampus.booking.dto;

import jakarta.validation.constraints.Size;

public record BookingCancelRequest(
		@Size(max = 500, message = "Reason must not exceed 500 characters")
		String reason
) {
}

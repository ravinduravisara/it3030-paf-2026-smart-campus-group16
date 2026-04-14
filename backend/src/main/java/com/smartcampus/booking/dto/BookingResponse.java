package com.smartcampus.booking.dto;

import com.smartcampus.booking.model.BookingStatus;

public record BookingResponse(
		String id,
		String resourceId,
		String requestedBy,
		BookingStatus status
) {
}

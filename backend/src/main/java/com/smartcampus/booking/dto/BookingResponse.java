package com.smartcampus.booking.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import com.smartcampus.booking.model.BookingStatus;

public record BookingResponse(
		String id,
		String resourceId,
		String resourceName,
		String requestedBy,
		BookingStatus status,
		LocalDate date,
		LocalTime startTime,
		LocalTime endTime,
		String purpose,
		Integer expectedAttendees,
		String decisionBy,
		String decisionReason,
		Instant decisionAt,
		Instant createdAt
) {
}

package com.smartcampus.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record BookingCreateRequest(
		@NotBlank(message = "Resource ID is required")
		String resourceId,

		@NotNull(message = "Date is required")
		@FutureOrPresent(message = "Booking date cannot be in the past")
		LocalDate date,

		@NotNull(message = "Start time is required")
		LocalTime startTime,

		@NotNull(message = "End time is required")
		LocalTime endTime,

		@NotBlank(message = "Purpose is required")
		@Size(min = 3, max = 500, message = "Purpose must be between 3 and 500 characters")
		String purpose,

		@Positive(message = "Expected attendees must be a positive number")
		Integer expectedAttendees
) {
}

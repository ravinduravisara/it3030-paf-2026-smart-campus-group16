package com.smartcampus.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookingCreateRequest(
		@NotBlank String resourceId,
		@NotNull LocalDate date,
		@NotNull LocalTime startTime,
		@NotNull LocalTime endTime,
		@NotBlank String purpose,
		Integer expectedAttendees
) {
}

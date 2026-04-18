package com.smartcampus.booking.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;

import org.springframework.stereotype.Service;

@Service
public class BookingConflictService {

	private final BookingRepository bookingRepository;

	public BookingConflictService(BookingRepository bookingRepository) {
		this.bookingRepository = bookingRepository;
	}

	public boolean hasConflict(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, String excludeBookingId) {
		List<Booking> existing = bookingRepository.findByResourceIdAndDateAndStatusIn(
				resourceId, date, List.of(BookingStatus.PENDING, BookingStatus.APPROVED));

		return existing.stream()
				.filter(b -> excludeBookingId == null || !b.getId().equals(excludeBookingId))
				.anyMatch(b -> startTime.isBefore(b.getEndTime()) && endTime.isAfter(b.getStartTime()));
	}
}

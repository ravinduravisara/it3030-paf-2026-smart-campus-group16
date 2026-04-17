package com.smartcampus.booking.service;

import java.util.List;

import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;

import org.springframework.stereotype.Service;

@Service
public class BookingService {
	private final BookingRepository bookingRepository;

	public BookingService(BookingRepository bookingRepository) {
		this.bookingRepository = bookingRepository;
	}

	public List<BookingResponse> listBookings() {
		return bookingRepository.findAll().stream().map(BookingService::toResponse).toList();
	}

	public BookingResponse getBooking(String id) {
		return bookingRepository.findById(id).map(BookingService::toResponse).orElse(null);
	}

	public BookingResponse createBooking(BookingCreateRequest request) {
		Booking booking = new Booking();
		booking.setResourceId(request.resourceId());
		booking.setRequestedBy(request.requestedBy());
		booking.setStatus(BookingStatus.PENDING);
		return toResponse(bookingRepository.save(booking));
	}

	private static BookingResponse toResponse(Booking booking) {
		return new BookingResponse(
				booking.getId(),
				booking.getResourceId(),
				booking.getRequestedBy(),
				booking.getStatus()
		);
	}
}

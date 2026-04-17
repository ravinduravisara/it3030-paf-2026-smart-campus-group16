package com.smartcampus.booking.controller;

import java.util.List;

import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.service.BookingService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
	private final BookingService bookingService;

	public BookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@GetMapping
	public List<BookingResponse> list() {
		return bookingService.listBookings();
	}

	@GetMapping("/{id}")
	public ResponseEntity<BookingResponse> get(@PathVariable String id) {
		BookingResponse booking = bookingService.getBooking(id);
		if (booking == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(booking);
	}

	@PostMapping
	public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingCreateRequest request) {
		return ResponseEntity.ok(bookingService.createBooking(request));
	}
}

package com.smartcampus.booking.controller;

import java.util.List;

import com.smartcampus.booking.dto.BookingCancelRequest;
import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingDecisionRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.service.BookingService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
	private final BookingService bookingService;

	public BookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@GetMapping
	public List<BookingResponse> list(Authentication auth,
									  @RequestParam(required = false) String status) {
		boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));

		if (isAdmin) {
			if (status != null && !status.isBlank()) {
				try {
					return bookingService.listByStatus(BookingStatus.valueOf(status.toUpperCase()));
				} catch (IllegalArgumentException e) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status filter: " + status);
				}
			}
			return bookingService.listAllBookings();
		}

		return bookingService.listMyBookings(auth.getName());
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
	public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingCreateRequest request,
												  Authentication auth) {
		return ResponseEntity.ok(bookingService.createBooking(request, auth.getName()));
	}

	@PatchMapping("/{id}/decide")
	public ResponseEntity<BookingResponse> decide(@PathVariable String id,
												  @Valid @RequestBody BookingDecisionRequest request,
												  Authentication auth) {
		return ResponseEntity.ok(bookingService.decide(id, request, auth.getName()));
	}

	@PatchMapping("/{id}/cancel")
	public ResponseEntity<BookingResponse> cancel(@PathVariable String id,
												  @Valid @RequestBody(required = false) BookingCancelRequest request,
												  Authentication auth) {
		boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
		return ResponseEntity.ok(bookingService.cancel(id, request, auth.getName(), isAdmin));
	}

	@PutMapping("/{id}/approve")
	public ResponseEntity<BookingResponse> approve(@PathVariable String id) {
		BookingResponse booking = bookingService.approveBooking(id);
		if (booking == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(booking);
	}

	@PutMapping("/{id}/reject")
	public ResponseEntity<BookingResponse> reject(@PathVariable String id) {
		BookingResponse booking = bookingService.rejectBooking(id);
		if (booking == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(booking);
	}
}

package com.smartcampus.booking.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.smartcampus.booking.dto.BookingCancelRequest;
import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingDecisionRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.repository.ResourceRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BookingService {
	private final BookingRepository bookingRepository;
	private final BookingConflictService conflictService;
	private final ResourceRepository resourceRepository;

	public BookingService(BookingRepository bookingRepository,
						  BookingConflictService conflictService,
						  ResourceRepository resourceRepository) {
		this.bookingRepository = bookingRepository;
		this.conflictService = conflictService;
		this.resourceRepository = resourceRepository;
	}

	public List<BookingResponse> listAllBookings() {
		return bookingRepository.findAll().stream().map(BookingService::toResponse).toList();
	}

	public List<BookingResponse> listMyBookings(String username) {
		return bookingRepository.findByRequestedBy(username).stream().map(BookingService::toResponse).toList();
	}

	public List<BookingResponse> listByStatus(BookingStatus status) {
		return bookingRepository.findByStatus(status).stream().map(BookingService::toResponse).toList();
	}

	public BookingResponse getBooking(String id) {
		return bookingRepository.findById(id).map(BookingService::toResponse).orElse(null);
	}

	public BookingResponse createBooking(BookingCreateRequest request, String username) {
		if (request.date().isBefore(LocalDate.now())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking date cannot be in the past");
		}

		if (!request.endTime().isAfter(request.startTime())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
		}

		Resource resource = resourceRepository.findById(request.resourceId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

		if (conflictService.hasConflict(request.resourceId(), request.date(), request.startTime(), request.endTime(), null)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Time slot conflicts with an existing booking");
		}

		Booking booking = new Booking();
		booking.setResourceId(request.resourceId());
		booking.setResourceName(resource.getName());
		booking.setRequestedBy(username);
		booking.setStatus(BookingStatus.PENDING);
		booking.setDate(request.date());
		booking.setStartTime(request.startTime());
		booking.setEndTime(request.endTime());
		booking.setPurpose(request.purpose());
		booking.setExpectedAttendees(request.expectedAttendees());
		return toResponse(bookingRepository.save(booking));
	}

	public BookingResponse decide(String id, BookingDecisionRequest request, String adminUsername) {
		Booking booking = bookingRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

		if (booking.getStatus() != BookingStatus.PENDING) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be approved or rejected");
		}

		String action = request.action().toUpperCase();
		if ("APPROVE".equals(action)) {
			if (conflictService.hasConflict(booking.getResourceId(), booking.getDate(), booking.getStartTime(), booking.getEndTime(), booking.getId())) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Time slot conflicts with another booking");
			}
			booking.setStatus(BookingStatus.APPROVED);
		} else if ("REJECT".equals(action)) {
			booking.setStatus(BookingStatus.REJECTED);
		} else {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Action must be APPROVE or REJECT");
		}

		booking.setDecisionBy(adminUsername);
		booking.setDecisionReason(request.reason());
		booking.setDecisionAt(Instant.now());
		return toResponse(bookingRepository.save(booking));
	}

	public BookingResponse cancel(String id, BookingCancelRequest request, String username, boolean isAdmin) {
		Booking booking = bookingRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

		if (!isAdmin && !booking.getRequestedBy().equals(username)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
		}

		if (!isAdmin && booking.getStatus() != BookingStatus.APPROVED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved bookings can be cancelled");
		}

		if (booking.getStatus() == BookingStatus.CANCELLED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking is already cancelled");
		}

		if (booking.getStatus() == BookingStatus.REJECTED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejected bookings cannot be cancelled");
		}

		booking.setStatus(BookingStatus.CANCELLED);
		booking.setDecisionBy(username);
		booking.setDecisionReason(request != null ? request.reason() : null);
		booking.setDecisionAt(Instant.now());
		return toResponse(bookingRepository.save(booking));
	}

	private static BookingResponse toResponse(Booking b) {
		return new BookingResponse(
				b.getId(),
				b.getResourceId(),
				b.getResourceName(),
				b.getRequestedBy(),
				b.getStatus(),
				b.getDate(),
				b.getStartTime(),
				b.getEndTime(),
				b.getPurpose(),
				b.getExpectedAttendees(),
				b.getDecisionBy(),
				b.getDecisionReason(),
				b.getDecisionAt(),
				b.getCreatedAt()
		);
	}
}

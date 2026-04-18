package com.smartcampus.booking.service;

import java.util.List;

import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.notification.model.NotificationType;
import com.smartcampus.notification.service.NotificationService;

import org.springframework.stereotype.Service;

@Service
public class BookingService {
	private final BookingRepository bookingRepository;
	private final NotificationService notificationService;

	public BookingService(BookingRepository bookingRepository, NotificationService notificationService) {
		this.bookingRepository = bookingRepository;
		this.notificationService = notificationService;
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

	public BookingResponse approveBooking(String id) {
		Booking booking = bookingRepository.findById(id).orElse(null);
		if (booking == null) {
			return null;
		}
		booking.setStatus(BookingStatus.APPROVED);
		Booking saved = bookingRepository.save(booking);
		notificationService.createNotification(
				saved.getRequestedBy(),
				null,
				"Your booking for resource " + saved.getResourceId() + " has been approved.",
				NotificationType.BOOKING
		);
		return toResponse(saved);
	}

	public BookingResponse rejectBooking(String id) {
		Booking booking = bookingRepository.findById(id).orElse(null);
		if (booking == null) {
			return null;
		}
		booking.setStatus(BookingStatus.REJECTED);
		Booking saved = bookingRepository.save(booking);
		notificationService.createNotification(
				saved.getRequestedBy(),
				null,
				"Your booking for resource " + saved.getResourceId() + " has been rejected.",
				NotificationType.BOOKING
		);
		return toResponse(saved);
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

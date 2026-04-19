package com.smartcampus.booking.repository;

import java.time.LocalDate;
import java.util.List;

import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {
	List<Booking> findByRequestedBy(String requestedBy);
	List<Booking> findByStatus(BookingStatus status);
	long countByStatus(BookingStatus status);
	List<Booking> findByResourceIdAndDateAndStatusIn(String resourceId, LocalDate date, List<BookingStatus> statuses);
	List<Booking> findByRequestedByAndStatus(String requestedBy, BookingStatus status);
	List<Booking> findByRequestedByAndDate(String requestedBy, LocalDate date);
	List<Booking> findByRequestedByAndResourceId(String requestedBy, String resourceId);
}

package com.smartcampus.booking.repository;

import com.smartcampus.booking.model.Booking;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {
}

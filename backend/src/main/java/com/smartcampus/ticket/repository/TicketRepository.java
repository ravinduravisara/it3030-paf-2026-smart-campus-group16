package com.smartcampus.ticket.repository;

import com.smartcampus.ticket.model.Ticket;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {
}

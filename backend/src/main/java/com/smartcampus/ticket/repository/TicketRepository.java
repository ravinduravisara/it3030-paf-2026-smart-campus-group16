package com.smartcampus.ticket.repository;

import java.util.List;

import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {
	List<Ticket> findByCreatedBy(String createdBy);
	List<Ticket> findByStatus(TicketStatus status);
	List<Ticket> findByPriority(TicketPriority priority);
	List<Ticket> findByCategory(String category);
	List<Ticket> findByAssignedTo(String assignedTo);
	List<Ticket> findByLocation(String location);
}

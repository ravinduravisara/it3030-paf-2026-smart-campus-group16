package com.smartcampus.publicapi.controller;

import java.util.List;

import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.resource.repository.ResourceRepository;
import com.smartcampus.ticket.model.TicketStatus;
import com.smartcampus.ticket.repository.TicketRepository;
import com.smartcampus.user.repository.UserRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicStatsController {
	private final BookingRepository bookingRepository;
	private final TicketRepository ticketRepository;
	private final ResourceRepository resourceRepository;
	private final UserRepository userRepository;

	public PublicStatsController(
			BookingRepository bookingRepository,
			TicketRepository ticketRepository,
			ResourceRepository resourceRepository,
			UserRepository userRepository) {
		this.bookingRepository = bookingRepository;
		this.ticketRepository = ticketRepository;
		this.resourceRepository = resourceRepository;
		this.userRepository = userRepository;
	}

	@GetMapping("/stats")
	public PublicStatsResponse getPublicStats() {
		long activeBookings = bookingRepository.countByStatus(BookingStatus.APPROVED);
		long openTickets = ticketRepository.countByStatusIn(List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS));

		long totalResources = resourceRepository.count();
		int resourceUsagePercent = percent(activeBookings, totalResources);

		long totalTickets = ticketRepository.count();
		long resolvedTickets = ticketRepository.countByStatusIn(List.of(TicketStatus.RESOLVED, TicketStatus.CLOSED));
		int ticketResolutionPercent = percent(resolvedTickets, totalTickets);

		long totalUsers = userRepository.count();
		long engagedUsers = userRepository.countByVerifiedTrue() + userRepository.countByVerifiedIsNull();
		int userEngagementPercent = percent(engagedUsers, totalUsers);

		return new PublicStatsResponse(
				activeBookings,
				openTickets,
				resourceUsagePercent,
				ticketResolutionPercent,
				userEngagementPercent);
	}

	private static int percent(long numerator, long denominator) {
		if (denominator <= 0) return 0;
		double value = (numerator * 100.0) / denominator;
		if (value < 0) value = 0;
		if (value > 100) value = 100;
		return (int) Math.round(value);
	}

	public record PublicStatsResponse(
			long activeBookings,
			long openTickets,
			int resourceUsagePercent,
			int ticketResolutionPercent,
			int userEngagementPercent) {
	}
}

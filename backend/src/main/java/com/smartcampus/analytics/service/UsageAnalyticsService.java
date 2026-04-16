package com.smartcampus.analytics.service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.smartcampus.analytics.dto.HourlyCountResponse;
import com.smartcampus.analytics.dto.TopResourceUsageResponse;
import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.repository.ResourceRepository;

import org.springframework.stereotype.Service;

@Service
public class UsageAnalyticsService {
	private final BookingRepository bookingRepository;
	private final ResourceRepository resourceRepository;

	public UsageAnalyticsService(BookingRepository bookingRepository, ResourceRepository resourceRepository) {
		this.bookingRepository = bookingRepository;
		this.resourceRepository = resourceRepository;
	}

	public List<TopResourceUsageResponse> getTopResources(int limit) {
		List<Booking> bookings = bookingRepository.findAll();
		Map<String, Long> countsByResource = bookings.stream()
				.map(Booking::getResourceId)
				.filter(id -> id != null && !id.isBlank())
				.collect(Collectors.groupingBy(id -> id, Collectors.counting()));

		Map<String, String> namesById = new HashMap<>();
		for (Resource r : resourceRepository.findAll()) {
			if (r.getId() != null && r.getName() != null) {
				namesById.putIfAbsent(r.getId(), r.getName());
			}
		}

		Comparator<Map.Entry<String, Long>> byCountDescThenId =
				Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())
						.thenComparing(Map.Entry::getKey);

		return countsByResource.entrySet().stream()
				.sorted(byCountDescThenId)
				.limit(limit)
				.map(e -> new TopResourceUsageResponse(
					e.getKey(),
					namesById.getOrDefault(e.getKey(), e.getKey()),
					e.getValue()
				))
				.toList();
	}

	public List<HourlyCountResponse> getPeakBookingHours() {
		int[] counts = new int[24];
		ZoneId zone = ZoneId.systemDefault();

		for (Booking b : bookingRepository.findAll()) {
			if (b.getCreatedAt() == null) continue;
			int hour = ZonedDateTime.ofInstant(b.getCreatedAt(), zone).getHour();
			counts[hour] += 1;
		}

		return java.util.stream.IntStream.range(0, 24)
				.mapToObj(hour -> new HourlyCountResponse(hour, counts[hour]))
				.toList();
	}
}

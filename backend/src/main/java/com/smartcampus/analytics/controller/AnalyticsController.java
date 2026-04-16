package com.smartcampus.analytics.controller;

import java.util.List;

import com.smartcampus.analytics.dto.HourlyCountResponse;
import com.smartcampus.analytics.dto.TopResourceUsageResponse;
import com.smartcampus.analytics.service.UsageAnalyticsService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@Validated
public class AnalyticsController {
	private final UsageAnalyticsService usageAnalyticsService;

	public AnalyticsController(UsageAnalyticsService usageAnalyticsService) {
		this.usageAnalyticsService = usageAnalyticsService;
	}

	@GetMapping("/top-resources")
	public List<TopResourceUsageResponse> topResources(
			@RequestParam(defaultValue = "5") @Min(1) @Max(50) int limit
	) {
		return usageAnalyticsService.getTopResources(limit);
	}

	@GetMapping("/peak-booking-hours")
	public List<HourlyCountResponse> peakBookingHours() {
		return usageAnalyticsService.getPeakBookingHours();
	}
}

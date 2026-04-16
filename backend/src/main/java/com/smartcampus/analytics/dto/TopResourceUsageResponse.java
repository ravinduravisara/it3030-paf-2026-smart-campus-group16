package com.smartcampus.analytics.dto;

public record TopResourceUsageResponse(
		String resourceId,
		String resourceName,
		long bookingCount
) {
}

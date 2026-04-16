package com.smartcampus.analytics.dto;

public record HourlyCountResponse(
		int hour,
		long count
) {
}

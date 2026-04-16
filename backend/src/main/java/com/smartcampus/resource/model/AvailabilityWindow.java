package com.smartcampus.resource.model;

import java.time.Instant;

public record AvailabilityWindow(
	Instant start,
	Instant end
) {
}

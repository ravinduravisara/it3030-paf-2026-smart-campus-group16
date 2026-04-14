package com.smartcampus.common.dto;

import java.time.Instant;

public record ApiErrorResponse(
	String message,
	String path,
	Instant timestamp
) {
}

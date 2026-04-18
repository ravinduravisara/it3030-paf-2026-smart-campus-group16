package com.smartcampus.comment.dto;

import java.time.Instant;

public record CommentResponse(
		String id,
		String ticketId,
		String authorUsername,
		String text,
		Instant createdAt,
		Instant updatedAt
) {
}

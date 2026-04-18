package com.smartcampus.notification.dto;

import java.time.Instant;

public record NotificationResponse(
	String id,
	String title,
	String message,
	String type,
	String sentBy,
	boolean read,
	String recipientId,
	String broadcastId,
	String audience,
	int recipientCount,
	Instant createdAt
) {
}

package com.smartcampus.notification.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NotificationCreateRequest(
	@Size(max = 200, message = "Title must not exceed 200 characters")
	String title,

	@NotBlank(message = "Message is required")
	@Size(min = 2, max = 2000, message = "Message must be between 2 and 2000 characters")
	String message,

	String type,

	List<String> recipientIds
) {
}

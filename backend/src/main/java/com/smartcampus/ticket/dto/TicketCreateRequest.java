package com.smartcampus.ticket.dto;

import java.util.List;

import com.smartcampus.ticket.model.AttachmentMetadata;
import com.smartcampus.ticket.model.TicketPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TicketCreateRequest(
		@NotBlank(message = "Title is required")
		@Size(max = 200, message = "Title must not exceed 200 characters")
		String title,

		@NotBlank(message = "Description is required")
		@Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
		String description,

		@NotBlank(message = "Category is required")
		String category,

		String resourceId,
		String location,

		TicketPriority priority,

		@Size(max = 200, message = "Contact info must not exceed 200 characters")
		String contactInfo,

		@Size(max = 3, message = "Maximum 3 attachments allowed")
		List<AttachmentMetadata> attachments
) {
}

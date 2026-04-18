package com.smartcampus.ticket.dto;

import java.util.List;

import com.smartcampus.ticket.model.AttachmentMetadata;
import com.smartcampus.ticket.model.TicketPriority;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TicketCreateRequest(
		@NotBlank(message = "Title is required")
		@Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
		String title,

		@NotBlank(message = "Description is required")
		@Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
		String description,

		@NotBlank(message = "Category is required")
		@Pattern(regexp = "IT_EQUIPMENT|ELECTRICAL|PLUMBING|HVAC|FURNITURE|CLEANING|SECURITY|OTHER",
				message = "Category must be one of: IT_EQUIPMENT, ELECTRICAL, PLUMBING, HVAC, FURNITURE, CLEANING, SECURITY, OTHER")
		String category,

		String resourceId,

		@Size(max = 300, message = "Location must not exceed 300 characters")
		String location,

		TicketPriority priority,

		@Size(max = 200, message = "Contact info must not exceed 200 characters")
		String contactInfo,

		@Size(max = 3, message = "Maximum 3 attachments allowed")
		@Valid
		List<AttachmentMetadata> attachments
) {
}

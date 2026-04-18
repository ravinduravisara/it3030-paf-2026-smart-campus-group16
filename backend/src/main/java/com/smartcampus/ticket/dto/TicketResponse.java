package com.smartcampus.ticket.dto;

import java.time.Instant;
import java.util.List;

import com.smartcampus.ticket.model.AttachmentMetadata;
import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;

public record TicketResponse(
		String id,
		String title,
		String description,
		String category,
		String resourceId,
		String resourceName,
		String location,
		String createdBy,
		String contactInfo,
		TicketPriority priority,
		TicketStatus status,
		String assignedTo,
		String resolutionNotes,
		String rejectionReason,
		List<AttachmentMetadata> attachments,
		Instant createdAt,
		Instant updatedAt,
		Instant resolvedAt,
		Instant firstResponseAt,
		Long timeToFirstResponseMs,
		Long timeToResolutionMs
) {
}

package com.smartcampus.ticket.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tickets")
public class Ticket {
	@Id
	private String id;

	private String title;
	private String description;
	private String category;
	private String resourceId;
	private String resourceName;
	private String location;
	private String createdBy;
	private String contactInfo;
	private TicketPriority priority;
	private TicketStatus status;
	private String assignedTo;
	private String resolutionNotes;
	private String rejectionReason;
	private List<AttachmentMetadata> attachments = new ArrayList<>();

	@CreatedDate
	private Instant createdAt;
	private Instant updatedAt;
	private Instant resolvedAt;

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public String getCategory() { return category; }
	public void setCategory(String category) { this.category = category; }

	public String getResourceId() { return resourceId; }
	public void setResourceId(String resourceId) { this.resourceId = resourceId; }

	public String getResourceName() { return resourceName; }
	public void setResourceName(String resourceName) { this.resourceName = resourceName; }

	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }

	public String getCreatedBy() { return createdBy; }
	public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

	public String getContactInfo() { return contactInfo; }
	public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }

	public TicketPriority getPriority() { return priority; }
	public void setPriority(TicketPriority priority) { this.priority = priority; }

	public TicketStatus getStatus() { return status; }
	public void setStatus(TicketStatus status) { this.status = status; }

	public String getAssignedTo() { return assignedTo; }
	public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

	public String getResolutionNotes() { return resolutionNotes; }
	public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

	public String getRejectionReason() { return rejectionReason; }
	public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

	public List<AttachmentMetadata> getAttachments() { return attachments; }
	public void setAttachments(List<AttachmentMetadata> attachments) { this.attachments = attachments; }

	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

	public Instant getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

	public Instant getResolvedAt() { return resolvedAt; }
	public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}

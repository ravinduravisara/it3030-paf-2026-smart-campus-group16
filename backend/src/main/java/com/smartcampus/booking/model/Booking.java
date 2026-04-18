package com.smartcampus.booking.model;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
public class Booking {
	@Id
	private String id;

	private String resourceId;
	private String resourceName;
	private String requestedBy;
	private BookingStatus status;

	private LocalDate date;
	private LocalTime startTime;
	private LocalTime endTime;
	private String purpose;
	private Integer expectedAttendees;

	private String decisionBy;
	private String decisionReason;
	private Instant decisionAt;

	@CreatedDate
	private Instant createdAt;

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getResourceId() { return resourceId; }
	public void setResourceId(String resourceId) { this.resourceId = resourceId; }

	public String getResourceName() { return resourceName; }
	public void setResourceName(String resourceName) { this.resourceName = resourceName; }

	public String getRequestedBy() { return requestedBy; }
	public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

	public BookingStatus getStatus() { return status; }
	public void setStatus(BookingStatus status) { this.status = status; }

	public LocalDate getDate() { return date; }
	public void setDate(LocalDate date) { this.date = date; }

	public LocalTime getStartTime() { return startTime; }
	public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

	public LocalTime getEndTime() { return endTime; }
	public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

	public String getPurpose() { return purpose; }
	public void setPurpose(String purpose) { this.purpose = purpose; }

	public Integer getExpectedAttendees() { return expectedAttendees; }
	public void setExpectedAttendees(Integer expectedAttendees) { this.expectedAttendees = expectedAttendees; }

	public String getDecisionBy() { return decisionBy; }
	public void setDecisionBy(String decisionBy) { this.decisionBy = decisionBy; }

	public String getDecisionReason() { return decisionReason; }
	public void setDecisionReason(String decisionReason) { this.decisionReason = decisionReason; }

	public Instant getDecisionAt() { return decisionAt; }
	public void setDecisionAt(Instant decisionAt) { this.decisionAt = decisionAt; }

	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

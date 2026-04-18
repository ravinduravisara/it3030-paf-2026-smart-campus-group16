package com.smartcampus.notification.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

	@Id
	private String id;

	private String title;
	private String message;
	private String type;
	private String sentBy;
	private boolean read;
	private String recipientId;
	private String broadcastId;
	private String audience;

	@CreatedDate
	private Instant createdAt;

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public String getType() { return type; }
	public void setType(String type) { this.type = type; }

	public String getSentBy() { return sentBy; }
	public void setSentBy(String sentBy) { this.sentBy = sentBy; }

	public boolean isRead() { return read; }
	public void setRead(boolean read) { this.read = read; }

	public String getRecipientId() { return recipientId; }
	public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

	public String getBroadcastId() { return broadcastId; }
	public void setBroadcastId(String broadcastId) { this.broadcastId = broadcastId; }

	public String getAudience() { return audience; }
	public void setAudience(String audience) { this.audience = audience; }
}

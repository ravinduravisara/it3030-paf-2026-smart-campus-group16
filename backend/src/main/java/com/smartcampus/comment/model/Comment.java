package com.smartcampus.comment.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "comments")
public class Comment {
	@Id
	private String id;
	private String ticketId;
	private String authorUsername;
	private String text;

	@CreatedDate
	private Instant createdAt;
	private Instant updatedAt;

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getTicketId() { return ticketId; }
	public void setTicketId(String ticketId) { this.ticketId = ticketId; }

	public String getAuthorUsername() { return authorUsername; }
	public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }

	public String getText() { return text; }
	public void setText(String text) { this.text = text; }

	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

	public Instant getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

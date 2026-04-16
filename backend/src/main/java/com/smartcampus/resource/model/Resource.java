package com.smartcampus.resource.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
public class Resource {
	@Id
	private String id;

	private String name;
	private ResourceType type;
	private Integer capacity;
	private ResourceStatus status;
	private String description;
	private String location;
	private List<AvailabilityWindow> availabilityWindows = new ArrayList<>();

	@CreatedDate
	private Instant createdAt;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public ResourceType getType() {
		return type;
	}

	public void setType(ResourceType type) {
		this.type = type;
	}

	public Integer getCapacity() {
		return capacity;
	}

	public void setCapacity(Integer capacity) {
		this.capacity = capacity;
	}

	public ResourceStatus getStatus() {
		return status;
	}

	public void setStatus(ResourceStatus status) {
		this.status = status;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	public List<AvailabilityWindow> getAvailabilityWindows() {
		return availabilityWindows;
	}

	public void setAvailabilityWindows(List<AvailabilityWindow> availabilityWindows) {
		this.availabilityWindows = availabilityWindows != null ? availabilityWindows : new ArrayList<>();
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}
}

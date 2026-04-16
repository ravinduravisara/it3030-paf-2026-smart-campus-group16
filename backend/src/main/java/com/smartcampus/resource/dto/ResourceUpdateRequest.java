package com.smartcampus.resource.dto;

import java.util.List;

import com.smartcampus.resource.model.AvailabilityWindow;
import com.smartcampus.resource.model.ResourceStatus;
import com.smartcampus.resource.model.ResourceType;

public record ResourceUpdateRequest(
	String name,
	ResourceType type,
	Integer capacity,
	ResourceStatus status,
	String description,
	String location,
	List<AvailabilityWindow> availabilityWindows
) {
}

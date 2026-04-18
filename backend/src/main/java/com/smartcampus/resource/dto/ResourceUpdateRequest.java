package com.smartcampus.resource.dto;

import java.util.List;

import com.smartcampus.resource.model.AvailabilityWindow;
import com.smartcampus.resource.model.ResourceStatus;
import com.smartcampus.resource.model.ResourceType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ResourceUpdateRequest(
	@Size(min = 2, max = 200) String name,
	ResourceType type,
	@Positive @Max(100000) Integer capacity,
	ResourceStatus status,
	@Size(max = 1000) String description,
	@Size(max = 300) String location,
	@Size(max = 20) List<AvailabilityWindow> availabilityWindows
) {
}

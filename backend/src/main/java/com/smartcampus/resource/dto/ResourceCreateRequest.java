package com.smartcampus.resource.dto;

import java.util.List;

import com.smartcampus.resource.model.AvailabilityWindow;
import com.smartcampus.resource.model.ResourceStatus;
import com.smartcampus.resource.model.ResourceType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ResourceCreateRequest(
	@NotBlank String name,
	@NotNull ResourceType type,
	@NotNull @Positive Integer capacity,
	ResourceStatus status,
	String description,
	String location,
	List<AvailabilityWindow> availabilityWindows
) {
}

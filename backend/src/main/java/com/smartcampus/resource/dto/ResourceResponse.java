package com.smartcampus.resource.dto;

import com.smartcampus.resource.model.ResourceStatus;
import com.smartcampus.resource.model.ResourceType;

public record ResourceResponse(
	String id,
	String name,
	ResourceType type,
	ResourceStatus status,
	String description,
	String location
) {
}

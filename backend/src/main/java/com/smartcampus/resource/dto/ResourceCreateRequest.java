package com.smartcampus.resource.dto;

import com.smartcampus.resource.model.ResourceType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResourceCreateRequest(
	@NotBlank String name,
	@NotNull ResourceType type,
	String description,
	String location
) {
}

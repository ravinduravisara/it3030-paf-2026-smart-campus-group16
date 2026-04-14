package com.smartcampus.resource.controller;

import java.util.List;

import com.smartcampus.resource.dto.ResourceCreateRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.ResourceUpdateRequest;
import com.smartcampus.resource.service.ResourceService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {
	private final ResourceService resourceService;

	public ResourceController(ResourceService resourceService) {
		this.resourceService = resourceService;
	}

	@GetMapping
	public List<ResourceResponse> list() {
		return resourceService.listResources();
	}

	@GetMapping("/{id}")
	public ResponseEntity<ResourceResponse> get(@PathVariable String id) {
		ResourceResponse resource = resourceService.getResource(id);
		if (resource == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(resource);
	}

	@PostMapping
	public ResponseEntity<ResourceResponse> create(@Valid @RequestBody ResourceCreateRequest request) {
		return ResponseEntity.ok(resourceService.createResource(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ResourceResponse> update(
			@PathVariable String id,
			@RequestBody ResourceUpdateRequest request
	) {
		ResourceResponse updated = resourceService.updateResource(id, request);
		if (updated == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(updated);
	}
}

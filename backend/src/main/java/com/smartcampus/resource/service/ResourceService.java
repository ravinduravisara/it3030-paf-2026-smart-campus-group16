package com.smartcampus.resource.service;

import java.util.List;

import com.smartcampus.resource.dto.ResourceCreateRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.ResourceUpdateRequest;
import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.model.ResourceStatus;
import com.smartcampus.resource.repository.ResourceRepository;

import org.springframework.stereotype.Service;

@Service
public class ResourceService {
	private final ResourceRepository resourceRepository;

	public ResourceService(ResourceRepository resourceRepository) {
		this.resourceRepository = resourceRepository;
	}

	public List<ResourceResponse> listResources() {
		return resourceRepository.findAll().stream().map(ResourceService::toResponse).toList();
	}

	public ResourceResponse getResource(String id) {
		return resourceRepository.findById(id).map(ResourceService::toResponse).orElse(null);
	}

	public ResourceResponse createResource(ResourceCreateRequest request) {
		Resource resource = new Resource();
		resource.setName(request.name());
		resource.setType(request.type());
		resource.setStatus(ResourceStatus.AVAILABLE);
		resource.setDescription(request.description());
		resource.setLocation(request.location());

		Resource saved = resourceRepository.save(resource);
		return toResponse(saved);
	}

	public ResourceResponse updateResource(String id, ResourceUpdateRequest request) {
		Resource resource = resourceRepository.findById(id).orElse(null);
		if (resource == null) {
			return null;
		}

		if (request.name() != null) {
			resource.setName(request.name());
		}
		if (request.type() != null) {
			resource.setType(request.type());
		}
		if (request.status() != null) {
			resource.setStatus(request.status());
		}
		if (request.description() != null) {
			resource.setDescription(request.description());
		}
		if (request.location() != null) {
			resource.setLocation(request.location());
		}

		Resource saved = resourceRepository.save(resource);
		return toResponse(saved);
	}

	private static ResourceResponse toResponse(Resource resource) {
		return new ResourceResponse(
				resource.getId(),
				resource.getName(),
				resource.getType(),
				resource.getStatus(),
				resource.getDescription(),
				resource.getLocation()
		);
	}
}

package com.smartcampus.resource.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import com.smartcampus.resource.dto.ResourceCreateRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.ResourceUpdateRequest;
import com.smartcampus.resource.model.AvailabilityWindow;
import com.smartcampus.resource.model.Resource;
import com.smartcampus.resource.model.ResourceStatus;
import com.smartcampus.resource.model.ResourceType;
import com.smartcampus.resource.repository.ResourceRepository;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ResourceService {
	private final ResourceRepository resourceRepository;
	private final MongoTemplate mongoTemplate;

	public ResourceService(ResourceRepository resourceRepository, MongoTemplate mongoTemplate) {
		this.resourceRepository = resourceRepository;
		this.mongoTemplate = mongoTemplate;
	}

	public List<ResourceResponse> listResources(
			ResourceType type,
			ResourceStatus status,
			Integer minCapacity,
			String location,
			String q
	) {
		boolean hasFilters = type != null
				|| status != null
				|| minCapacity != null
				|| StringUtils.hasText(location)
				|| StringUtils.hasText(q);

		if (!hasFilters) {
			return resourceRepository.findAll().stream().map(ResourceService::toResponse).toList();
		}

		List<Criteria> criteria = new ArrayList<>();

		if (type != null) {
			criteria.add(Criteria.where("type").is(type));
		}
		if (status != null) {
			// Backward compatible: old persisted statuses (AVAILABLE/UNAVAILABLE/MAINTENANCE)
			// should still match the new ACTIVE/OUT_OF_SERVICE filter semantics.
			List<String> persistedStatuses = status == ResourceStatus.ACTIVE
					? List.of("ACTIVE", "AVAILABLE")
					: List.of("OUT_OF_SERVICE", "UNAVAILABLE", "MAINTENANCE");
			criteria.add(Criteria.where("status").in(persistedStatuses));
		}
		if (minCapacity != null) {
			criteria.add(Criteria.where("capacity").gte(minCapacity));
		}
		if (StringUtils.hasText(location)) {
			Pattern p = Pattern.compile(Pattern.quote(location.trim()), Pattern.CASE_INSENSITIVE);
			criteria.add(Criteria.where("location").regex(p));
		}
		if (StringUtils.hasText(q)) {
			Pattern p = Pattern.compile(Pattern.quote(q.trim()), Pattern.CASE_INSENSITIVE);
			criteria.add(new Criteria().orOperator(
					Criteria.where("name").regex(p),
					Criteria.where("description").regex(p),
					Criteria.where("location").regex(p)
			));
		}

		Query query = new Query();
		if (!criteria.isEmpty()) {
			query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
		}

		return mongoTemplate.find(query, Resource.class).stream().map(ResourceService::toResponse).toList();
	}

	public ResourceResponse getResource(String id) {
		return resourceRepository.findById(id).map(ResourceService::toResponse).orElse(null);
	}

	public ResourceResponse createResource(ResourceCreateRequest request) {
		Resource resource = new Resource();
		resource.setName(request.name());
		resource.setType(request.type());
		resource.setCapacity(request.capacity());
		resource.setStatus(request.status() != null ? request.status() : ResourceStatus.ACTIVE);
		resource.setDescription(request.description());
		resource.setLocation(request.location());
		if (request.availabilityWindows() != null) {
			validateAvailabilityWindows(request.availabilityWindows());
			resource.setAvailabilityWindows(request.availabilityWindows());
		}

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
		if (request.capacity() != null) {
			if (request.capacity() <= 0) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "capacity must be positive");
			}
			resource.setCapacity(request.capacity());
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
		if (request.availabilityWindows() != null) {
			validateAvailabilityWindows(request.availabilityWindows());
			resource.setAvailabilityWindows(request.availabilityWindows());
		}

		Resource saved = resourceRepository.save(resource);
		return toResponse(saved);
	}

	public boolean deleteResource(String id) {
		if (!resourceRepository.existsById(id)) {
			return false;
		}
		resourceRepository.deleteById(id);
		return true;
	}

	private static void validateAvailabilityWindows(List<AvailabilityWindow> windows) {
		for (AvailabilityWindow window : windows) {
			if (window == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "availabilityWindows contains null item");
			}
			if (window.start() == null || window.end() == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "availabilityWindows requires start and end");
			}
			if (!window.start().isBefore(window.end())) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "availabilityWindows requires start < end");
			}
		}
	}

	private static ResourceResponse toResponse(Resource resource) {
		return new ResourceResponse(
				resource.getId(),
				resource.getName(),
				resource.getType(),
				resource.getCapacity(),
				resource.getStatus(),
				resource.getDescription(),
				resource.getLocation(),
				resource.getAvailabilityWindows()
		);
	}
}

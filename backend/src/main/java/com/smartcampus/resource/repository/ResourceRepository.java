package com.smartcampus.resource.repository;

import com.smartcampus.resource.model.Resource;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}

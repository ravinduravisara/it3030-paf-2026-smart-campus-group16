package com.smartcampus.audit.repository;

import com.smartcampus.audit.model.AuditLog;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
}

package com.smartcampus.common.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {
    private final MongoTemplate mongoTemplate;

    public HealthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping
    public Map<String, Object> health() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "UP");

        try {
            mongoTemplate.getDb().runCommand(new Document("ping", 1));
            result.put("mongo", "UP");
        } catch (Exception ex) {
            result.put("mongo", "DOWN");
            result.put("mongoError", ex.getClass().getSimpleName());
        }

        return result;
    }
}

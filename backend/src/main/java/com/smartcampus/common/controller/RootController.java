package com.smartcampus.common.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {
	@GetMapping("/")
	public Map<String, Object> root() {
		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("name", "smartcampus-backend");
		payload.put("status", "UP");
		payload.put("message", "Backend API is running. Use /api/* endpoints.");
		payload.put("health", "/api/health");
		payload.put("actuatorHealth", "/actuator/health");
		return payload;
	}
}
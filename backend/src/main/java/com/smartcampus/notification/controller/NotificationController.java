package com.smartcampus.notification.controller;

import java.util.List;

import com.smartcampus.notification.dto.NotificationCreateRequest;
import com.smartcampus.notification.dto.NotificationResponse;
import com.smartcampus.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@PostMapping("/broadcast")
	public ResponseEntity<List<NotificationResponse>> broadcast(
			@Valid @RequestBody NotificationCreateRequest request,
			Authentication authentication
	) {
		String sentBy = authentication.getName();
		List<NotificationResponse> notifications = notificationService.sendToAllUsers(request, sentBy);
		return ResponseEntity.ok(notifications);
	}

	@GetMapping("/broadcasts")
	public List<NotificationResponse> getBroadcastHistory() {
		return notificationService.getBroadcastHistory();
	}

	@GetMapping("/my")
	public List<NotificationResponse> getMyNotifications(Authentication authentication) {
		String username = authentication.getName();
		return notificationService.getNotificationsForUsername(username);
	}

	@GetMapping
	public List<NotificationResponse> getAll() {
		return notificationService.getAllNotifications();
	}

	@PutMapping("/broadcasts/{broadcastId}")
	public ResponseEntity<NotificationResponse> updateBroadcast(
			@PathVariable String broadcastId,
			@Valid @RequestBody NotificationCreateRequest request
	) {
		NotificationResponse response = notificationService.updateBroadcast(broadcastId, request);
		if (response == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/broadcasts/{broadcastId}")
	public ResponseEntity<Void> deleteBroadcast(@PathVariable String broadcastId) {
		boolean deleted = notificationService.deleteBroadcast(broadcastId);
		if (!deleted) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/read")
	public ResponseEntity<NotificationResponse> markAsRead(
			@PathVariable String id,
			Authentication authentication
	) {
		NotificationResponse response = notificationService.markAsReadForUser(id, authentication.getName());
		if (response == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> dismissNotification(
			@PathVariable String id,
			Authentication authentication
	) {
		boolean deleted = notificationService.deleteForUser(id, authentication.getName());
		if (!deleted) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.noContent().build();
	}
}

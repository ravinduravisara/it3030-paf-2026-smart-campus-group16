package com.smartcampus.notification.controller;

import java.util.List;
import java.util.Map;

import com.smartcampus.notification.model.Notification;
import com.smartcampus.notification.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@PostMapping("/broadcast")
	public ResponseEntity<List<Notification>> broadcast(@RequestBody Map<String, String> body) {
		String title = body.get("title");
		String message = body.get("message");
		if (message == null || message.isBlank()) {
			return ResponseEntity.badRequest().build();
		}
		return ResponseEntity.ok(notificationService.sendToAllUsers(title, message));
	}

	@PostMapping("/send")
	public ResponseEntity<List<Notification>> sendToSelected(@RequestBody Map<String, Object> body) {
		String title = (String) body.get("title");
		String message = (String) body.get("message");
		@SuppressWarnings("unchecked")
		List<String> userIds = (List<String>) body.get("userIds");
		if (message == null || message.isBlank() || userIds == null || userIds.isEmpty()) {
			return ResponseEntity.badRequest().build();
		}
		return ResponseEntity.ok(notificationService.sendToSelectedUsers(userIds, title, message));
	}

	@GetMapping("/user/{userId}")
	public List<Notification> getByUser(@PathVariable String userId) {
		return notificationService.getNotificationsByUserId(userId);
	}

	@GetMapping("/user/{userId}/unread-count")
	public ResponseEntity<Long> getUnreadCount(@PathVariable String userId) {
		return ResponseEntity.ok(notificationService.getUnreadCount(userId));
	}

	@PutMapping("/{id}/read")
	public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
		Notification notification = notificationService.markAsRead(id);
		if (notification == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(notification);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable String id) {
		if (!notificationService.deleteNotification(id)) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.noContent().build();
	}
}

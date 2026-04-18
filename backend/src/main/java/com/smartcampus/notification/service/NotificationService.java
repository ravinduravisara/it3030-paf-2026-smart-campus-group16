package com.smartcampus.notification.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.smartcampus.notification.dto.NotificationCreateRequest;
import com.smartcampus.notification.dto.NotificationResponse;
import com.smartcampus.notification.model.Notification;
import com.smartcampus.notification.repository.NotificationRepository;
import com.smartcampus.user.model.User;
import com.smartcampus.user.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

	private final NotificationRepository notificationRepository;
	private final UserRepository userRepository;

	public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
		this.notificationRepository = notificationRepository;
		this.userRepository = userRepository;
	}

	/**
	 * Send a single system notification to a user identified by username/email.
	 */
	public void sendToUser(String recipientUsername, String title, String message, String type) {
		User user = userRepository.findByEmailIgnoreCase(recipientUsername);
		if (user == null) user = userRepository.findByUsernameIgnoreCase(recipientUsername);
		if (user == null) return;

		Notification n = new Notification();
		n.setTitle(title);
		n.setMessage(message);
		n.setType(type != null ? type : "SYSTEM");
		n.setSentBy("SYSTEM");
		n.setRead(false);
		n.setRecipientId(user.getId());
		n.setAudience("SINGLE");
		notificationRepository.save(n);
	}

	public List<NotificationResponse> sendToAllUsers(NotificationCreateRequest request, String sentBy) {
		List<User> targetUsers;
		String audience;

		if (request.recipientIds() != null && !request.recipientIds().isEmpty()) {
			targetUsers = userRepository.findAllById(request.recipientIds());
			audience = "SELECTED";
		} else {
			targetUsers = userRepository.findAll();
			audience = "ALL";
		}

		String type = request.type() != null ? request.type() : "GENERAL";
		String broadcastId = UUID.randomUUID().toString();
		int recipientCount = targetUsers.size();

		List<Notification> notifications = targetUsers.stream().map(user -> {
			Notification n = new Notification();
			n.setTitle(request.title() != null ? request.title().trim() : null);
			n.setMessage(request.message().trim());
			n.setType(type);
			n.setSentBy(sentBy);
			n.setRead(false);
			n.setRecipientId(user.getId());
			n.setBroadcastId(broadcastId);
			n.setAudience(audience);
			return n;
		}).toList();

		List<Notification> saved = notificationRepository.saveAll(notifications);
		return saved.stream().map(n -> toResponse(n, recipientCount)).toList();
	}

	public List<NotificationResponse> getBroadcastHistory() {
		List<Notification> all = notificationRepository.findByBroadcastIdNotNullOrderByCreatedAtDesc();
		Map<String, List<Notification>> grouped = new LinkedHashMap<>();
		for (Notification n : all) {
			grouped.computeIfAbsent(n.getBroadcastId(), k -> new ArrayList<>()).add(n);
		}
		List<NotificationResponse> result = new ArrayList<>();
		for (Map.Entry<String, List<Notification>> entry : grouped.entrySet()) {
			List<Notification> group = entry.getValue();
			Notification first = group.get(0);
			result.add(toResponse(first, group.size()));
		}
		return result;
	}

	public List<NotificationResponse> getNotificationsForUser(String userId) {
		return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
				.stream().map(n -> toResponse(n, 0)).toList();
	}

	public List<NotificationResponse> getNotificationsForUsername(String username) {
		User user = userRepository.findByEmailIgnoreCase(username);
		if (user == null) {
			user = userRepository.findByUsernameIgnoreCase(username);
		}
		if (user == null) {
			return List.of();
		}
		return getNotificationsForUser(user.getId());
	}

	public NotificationResponse markAsReadForUser(String notificationId, String username) {
		Notification n = notificationRepository.findById(notificationId).orElse(null);
		if (n == null) return null;
		User user = userRepository.findByEmailIgnoreCase(username);
		if (user == null) user = userRepository.findByUsernameIgnoreCase(username);
		if (user == null || !user.getId().equals(n.getRecipientId())) return null;
		n.setRead(true);
		return toResponse(notificationRepository.save(n), 0);
	}

	public List<NotificationResponse> getAllNotifications() {
		return notificationRepository.findAllByOrderByCreatedAtDesc()
				.stream().map(n -> toResponse(n, 0)).toList();
	}

	public long getUnreadCount(String userId) {
		return notificationRepository.findByRecipientIdAndReadFalse(userId).size();
	}

	public NotificationResponse markAsRead(String notificationId) {
		Notification n = notificationRepository.findById(notificationId).orElse(null);
		if (n == null) return null;
		n.setRead(true);
		return toResponse(notificationRepository.save(n), 0);
	}

	public NotificationResponse updateBroadcast(String broadcastId, NotificationCreateRequest request) {
		List<Notification> notifications = notificationRepository.findByBroadcastId(broadcastId);
		if (notifications.isEmpty()) return null;
		for (Notification n : notifications) {
			if (request.title() != null) n.setTitle(request.title().trim());
			else n.setTitle(null);
			n.setMessage(request.message().trim());
		}
		List<Notification> saved = notificationRepository.saveAll(notifications);
		Notification first = saved.get(0);
		return toResponse(first, saved.size());
	}

	public boolean deleteBroadcast(String broadcastId) {
		List<Notification> notifications = notificationRepository.findByBroadcastId(broadcastId);
		if (notifications.isEmpty()) return false;
		notificationRepository.deleteAll(notifications);
		return true;
	}

	public boolean deleteForUser(String notificationId, String username) {
		Notification n = notificationRepository.findById(notificationId).orElse(null);
		if (n == null) return false;
		User user = userRepository.findByEmailIgnoreCase(username);
		if (user == null) user = userRepository.findByUsernameIgnoreCase(username);
		if (user == null || !user.getId().equals(n.getRecipientId())) return false;
		notificationRepository.delete(n);
		return true;
	}

	private static NotificationResponse toResponse(Notification n, int recipientCount) {
		return new NotificationResponse(
				n.getId(),
				n.getTitle(),
				n.getMessage(),
				n.getType(),
				n.getSentBy(),
				n.isRead(),
				n.getRecipientId(),
				n.getBroadcastId(),
				n.getAudience(),
				recipientCount,
				n.getCreatedAt()
		);
	}
}

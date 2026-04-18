package com.smartcampus.notification.service;

import java.util.ArrayList;
import java.util.List;

import com.smartcampus.notification.model.Notification;
import com.smartcampus.notification.model.NotificationType;
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

	public List<Notification> sendToAllUsers(String title, String message) {
		List<User> users = userRepository.findAll();
		List<Notification> notifications = new ArrayList<>();
		for (User user : users) {
			notifications.add(createNotification(user.getId(), title, message, NotificationType.GENERAL));
		}
		return notifications;
	}

	public List<Notification> sendToSelectedUsers(List<String> userIds, String title, String message) {
		List<Notification> notifications = new ArrayList<>();
		for (String userId : userIds) {
			notifications.add(createNotification(userId, title, message, NotificationType.GENERAL));
		}
		return notifications;
	}

	public Notification createNotification(String userId, String title, String message, NotificationType type) {
		Notification notification = new Notification();
		notification.setUserId(userId);
		notification.setTitle(title);
		notification.setMessage(message);
		notification.setType(type);
		notification.setIsRead(false);
		return notificationRepository.save(notification);
	}

	public List<Notification> getNotificationsByUserId(String userId) {
		return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
	}

	public long getUnreadCount(String userId) {
		return notificationRepository.countByUserIdAndIsRead(userId, false);
	}

	public Notification markAsRead(String id) {
		Notification notification = notificationRepository.findById(id).orElse(null);
		if (notification == null) {
			return null;
		}
		notification.setIsRead(true);
		return notificationRepository.save(notification);
	}

	public Notification updateNotification(String id, String title, String message) {
		Notification notification = notificationRepository.findById(id).orElse(null);
		if (notification == null) {
			return null;
		}
		if (title != null) {
			notification.setTitle(title);
		}
		if (message != null && !message.isBlank()) {
			notification.setMessage(message);
		}
		return notificationRepository.save(notification);
	}

	public boolean deleteNotification(String id) {
		if (!notificationRepository.existsById(id)) {
			return false;
		}
		notificationRepository.deleteById(id);
		return true;
	}

	public List<Notification> getSentNotifications() {
		return notificationRepository.findByTypeOrderByCreatedAtDesc(NotificationType.GENERAL);
	}
}

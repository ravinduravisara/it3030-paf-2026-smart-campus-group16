package com.smartcampus.notification.repository;

import java.util.List;

import com.smartcampus.notification.model.Notification;
import com.smartcampus.notification.model.NotificationType;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
	List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

	long countByUserIdAndIsRead(String userId, boolean isRead);

	List<Notification> findByTypeOrderByCreatedAtDesc(NotificationType type);
}

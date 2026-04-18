package com.smartcampus.notification.repository;

import java.util.List;

import com.smartcampus.notification.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
	List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
	List<Notification> findByRecipientIdAndReadFalse(String recipientId);
	List<Notification> findAllByOrderByCreatedAtDesc();
	List<Notification> findByBroadcastIdNotNullOrderByCreatedAtDesc();
	List<Notification> findByBroadcastId(String broadcastId);
	void deleteByBroadcastId(String broadcastId);
}

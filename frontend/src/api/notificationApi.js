import { getJson, putJson, deleteJson, postJson } from '../services/api.js'

export function fetchNotifications(userId) {
	return getJson(`/api/notifications/user/${userId}`)
}

export function fetchUnreadCount(userId) {
	return getJson(`/api/notifications/user/${userId}/unread-count`)
}

export function markNotificationRead(id) {
	return putJson(`/api/notifications/${id}/read`)
}

export function updateNotification(id, title, message) {
	return putJson(`/api/notifications/${id}`, { title, message })
}

export function deleteNotification(id) {
	return deleteJson(`/api/notifications/${id}`)
}

export function broadcastNotification(title, message) {
	return postJson('/api/notifications/broadcast', { title, message })
}

export function sendNotificationToUsers(userIds, title, message) {
	return postJson('/api/notifications/send', { userIds, title, message })
}

export function fetchSentNotifications() {
	return getJson('/api/notifications/sent')
}

export function fetchAllUsers() {
	return getJson('/api/users')
}

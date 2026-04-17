import { useState, useEffect, useCallback } from 'react'
import {
	fetchNotifications,
	fetchUnreadCount,
	markNotificationRead,
	deleteNotification,
} from '../api/notificationApi.js'

export function useNotifications(userId) {
	const [notifications, setNotifications] = useState([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(false)

	const load = useCallback(async () => {
		if (!userId) return
		setLoading(true)
		try {
			const [items, count] = await Promise.all([
				fetchNotifications(userId),
				fetchUnreadCount(userId),
			])
			setNotifications(items)
			setUnreadCount(count)
		} catch (err) {
			console.error('Failed to load notifications', err)
		} finally {
			setLoading(false)
		}
	}, [userId])

	useEffect(() => {
		load()
		const interval = setInterval(load, 30000)
		return () => clearInterval(interval)
	}, [load])

	const markRead = useCallback(async (id) => {
		try {
			await markNotificationRead(id)
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
			)
			setUnreadCount((prev) => Math.max(0, prev - 1))
		} catch (err) {
			console.error('Failed to mark notification as read', err)
		}
	}, [])

	const remove = useCallback(async (id) => {
		try {
			const notification = notifications.find((n) => n.id === id)
			await deleteNotification(id)
			setNotifications((prev) => prev.filter((n) => n.id !== id))
			if (notification && !notification.isRead) {
				setUnreadCount((prev) => Math.max(0, prev - 1))
			}
		} catch (err) {
			console.error('Failed to delete notification', err)
		}
	}, [notifications])

	return { notifications, unreadCount, loading, markRead, remove, refresh: load }
}

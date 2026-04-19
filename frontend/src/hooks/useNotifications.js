import { useCallback, useEffect, useState, useRef } from 'react'
import { fetchMyNotifications, markNotificationRead, dismissNotification } from '../api/notificationApi.js'

const POLL_INTERVAL = 30000

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const intervalRef = useRef(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await fetchMyNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [load])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function markRead(id) {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch { /* ignore */ }
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.read)
    for (const n of unread) {
      try { await markNotificationRead(n.id) } catch { /* ignore */ }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function dismiss(id) {
    try {
      await dismissNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch { /* ignore */ }
  }

  return { notifications, unreadCount, loading, error, reload: load, markRead, markAllRead, dismiss }
}

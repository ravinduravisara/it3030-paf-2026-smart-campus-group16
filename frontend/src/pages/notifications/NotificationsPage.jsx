import { useEffect, useState } from 'react'
import { getJson, patchJson, deleteJson } from '../../services/api.js'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    setLoading(true)
    setError('')
    try {
      const data = await getJson('/api/notifications/my')
      setNotifications(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await patchJson(`/api/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch {
      // ignore
    }
  }

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => !n.read)
    for (const n of unread) {
      try {
        await patchJson(`/api/notifications/${n.id}/read`)
      } catch {
        // ignore
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function handleDismiss(id) {
    try {
      await deleteJson(`/api/notifications/${id}`)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      // ignore
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  function formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now - d
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 7) return `${diffDay}d ago`
    return d.toLocaleDateString()
  }

  return (
    <section className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Notifications
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Your notifications
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-12 text-center text-sm text-gray-400 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            Loading notifications…
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-12 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="text-4xl">🔔</div>
            <p className="mt-3 text-sm font-semibold text-gray-500">No notifications yet</p>
            <p className="mt-1 text-sm text-gray-400">
              You'll see notifications here when an admin sends them.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-5 transition ${
                n.read
                  ? 'border-gray-100 bg-white/60'
                  : 'border-indigo-200 bg-indigo-50/50 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
                      n.read
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-gradient-to-br from-indigo-100 to-cyan-100 text-indigo-600'
                    }`}
                  >
                    🔔
                  </div>
                  <div className="min-w-0">
                    {n.title && (
                      <p className={`text-sm font-bold ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                    )}
                    <p className={`text-sm break-words ${n.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {n.message}
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400">{formatTime(n.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(n.id)}
                    className="shrink-0 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
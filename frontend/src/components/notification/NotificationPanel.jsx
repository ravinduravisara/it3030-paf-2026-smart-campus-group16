import { useEffect, useRef } from 'react'
import NotificationItem from './NotificationItem.jsx'
import { useNotifications } from '../../hooks/useNotifications.js'

export default function NotificationPanel({ open, onClose }) {
  const panelRef = useRef(null)
  const { notifications, unreadCount, loading, markRead, markAllRead, dismiss } = useNotifications()

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  if (!open) return null

  const recent = notifications.slice(0, 10)

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 max-h-[480px] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl z-[100]"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 rounded-t-2xl">
        <h3 className="text-sm font-bold text-gray-900">
          Notifications {unreadCount > 0 && <span className="text-indigo-600">({unreadCount})</span>}
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Mark all read
            </button>
          )}
          <a
            href="#notifications"
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition"
          >
            View all
          </a>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-6">Loading…</p>
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl">🔔</div>
            <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          recent.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={markRead}
              onDismiss={dismiss}
            />
          ))
        )}
      </div>

      {notifications.length > 10 && (
        <div className="border-t border-gray-100 p-3 text-center">
          <a
            href="#notifications"
            onClick={onClose}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            See all {notifications.length} notifications
          </a>
        </div>
      )}
    </div>
  )
}

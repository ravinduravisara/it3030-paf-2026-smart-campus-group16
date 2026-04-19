import { useNotifications } from '../../hooks/useNotifications.js'
import NotificationItem from '../../components/notification/NotificationItem.jsx'

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, markRead, markAllRead, dismiss } = useNotifications()

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
            onClick={markAllRead}
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
              You'll see notifications here for booking decisions, ticket updates, and comments.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={markRead}
              onDismiss={dismiss}
            />
          ))
        )}
      </div>
    </section>
  )
}
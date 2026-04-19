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

const TYPE_ICONS = {
  BOOKING: '📅',
  TICKET: '🎫',
  COMMENT: '💬',
  SYSTEM: '⚙️',
  GENERAL: '📢',
}

export default function NotificationItem({ notification, onMarkRead, onDismiss }) {
  const n = notification
  const icon = TYPE_ICONS[n.type] || '🔔'

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        n.read
          ? 'border-gray-100 bg-white/60'
          : 'border-indigo-200 bg-indigo-50/50 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base ${
              n.read
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gradient-to-br from-indigo-100 to-cyan-100 text-indigo-600'
            }`}
          >
            {icon}
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
            <p className="mt-1 text-xs text-gray-400">{formatTime(n.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!n.read && onMarkRead && (
            <button
              onClick={() => onMarkRead(n.id)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Read
            </button>
          )}
          {onDismiss && (
            <button
              onClick={() => onDismiss(n.id)}
              className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

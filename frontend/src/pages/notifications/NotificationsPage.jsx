import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useNotifications } from '../../hooks/useNotifications.js'
import NotificationItem from '../../components/notification/NotificationItem.jsx'
import { broadcastNotification, sendNotificationToUsers, fetchAllUsers } from '../../api/notificationApi.js'

export default function NotificationsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const { notifications, unreadCount, loading, markRead, remove, refresh } = useNotifications(user?.id)

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sendMode, setSendMode] = useState('all')
  const [users, setUsers] = useState([])
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState('')
  const [usersLoading, setUsersLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    setUsersLoading(true)
    fetchAllUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false))
  }, [isAdmin])

  function toggleUser(id) {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    )
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setSendResult('')
    try {
      if (sendMode === 'all') {
        const result = await broadcastNotification(title.trim(), message.trim())
        setSendResult(`Notification sent to ${result.length} user(s).`)
      } else {
        if (selectedUserIds.length === 0) {
          setSendResult('Please select at least one user.')
          setSending(false)
          return
        }
        const result = await sendNotificationToUsers(selectedUserIds, title.trim(), message.trim())
        setSendResult(`Notification sent to ${result.length} user(s).`)
      }
      setTitle('')
      setMessage('')
      setSelectedUserIds([])
      refresh()
    } catch (err) {
      setSendResult('Failed to send notification.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {isAdmin && (
        <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">
            Admin
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
            Send notification
          </h2>

          <form onSubmit={handleSend} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Notification title (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Type your notification message…"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSendMode('all')}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  sendMode === 'all'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                All users
              </button>
              <button
                type="button"
                onClick={() => setSendMode('selected')}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  sendMode === 'selected'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Select users
              </button>
            </div>

            {sendMode === 'selected' && (
              <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                {usersLoading ? (
                  <p className="text-sm text-slate-400">Loading users…</p>
                ) : users.length === 0 ? (
                  <p className="text-sm text-slate-400">No users found.</p>
                ) : (
                  <div className="space-y-1">
                    {users.map((u) => (
                      <label
                        key={u.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition ${
                          selectedUserIds.includes(u.id) ? 'bg-indigo-50' : 'hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(u.id)}
                          onChange={() => toggleUser(u.id)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-semibold text-slate-800">
                          {u.name || u.username || u.email}
                        </span>
                        <span className="text-xs text-slate-400">{u.email}</span>
                      </label>
                    ))}
                  </div>
                )}
                {selectedUserIds.length > 0 && (
                  <p className="mt-2 text-xs font-bold text-indigo-600">
                    {selectedUserIds.length} user(s) selected
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {sending ? 'Sending…' : 'Send notification'}
              </button>
              {sendResult && (
                <span className="text-sm font-semibold text-emerald-600">{sendResult}</span>
              )}
            </div>
          </form>
        </section>
      )}

      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">
              Notifications
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Your notifications
            </h2>
            <p className="mt-2 text-sm leading-7 text-gray-600">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.`
                : 'You\u2019re all caught up.'}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {loading && notifications.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 px-6 py-12 text-center text-sm text-slate-400">
              Loading notifications…
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 px-6 py-12 text-center text-sm text-slate-400">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={markRead}
                onDelete={remove}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

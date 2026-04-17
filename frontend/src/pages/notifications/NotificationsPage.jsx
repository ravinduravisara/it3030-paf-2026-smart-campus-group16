import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useNotifications } from '../../hooks/useNotifications.js'
import NotificationItem from '../../components/notification/NotificationItem.jsx'
import { broadcastNotification, sendNotificationToUsers, fetchAllUsers, fetchSentNotifications, deleteNotification, updateNotification } from '../../api/notificationApi.js'

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
  const [sentNotifications, setSentNotifications] = useState([])
  const [sentLoading, setSentLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState(null)

  /* Group sent notifications that share the same title+message+timestamp (broadcast) */
  const sentGroups = (() => {
    const map = new Map()
    for (const n of sentNotifications) {
      const ts = n.createdAt ? new Date(n.createdAt).toISOString().slice(0, 16) : ''
      const key = `${n.title || ''}||${n.message || ''}||${ts}`
      if (!map.has(key)) {
        map.set(key, { key, title: n.title, message: n.message, createdAt: n.createdAt, items: [] })
      }
      map.get(key).items.push(n)
    }
    return [...map.values()]
  })()

  useEffect(() => {
    if (!isAdmin) return
    setUsersLoading(true)
    fetchAllUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false))
    loadSentNotifications()
  }, [isAdmin])

  function loadSentNotifications() {
    if (!isAdmin) return
    setSentLoading(true)
    fetchSentNotifications()
      .then((data) => setSentNotifications(Array.isArray(data) ? data : []))
      .catch(() => setSentNotifications([]))
      .finally(() => setSentLoading(false))
  }

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
      loadSentNotifications()
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

      {isAdmin && (
        <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">
            Admin
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
            Sent notifications
          </h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            History of manually sent notifications.
          </p>

          <div className="mt-6 space-y-3">
            {sentLoading && sentNotifications.length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 px-6 py-12 text-center text-sm text-slate-400">
                Loading…
              </div>
            ) : sentGroups.length === 0 ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 px-6 py-12 text-center text-sm text-slate-400">
                No sent notifications yet.
              </div>
            ) : (
              sentGroups.map((group) => {
                const isExpanded = expandedGroup === group.key
                const representative = group.items[0]
                return (
                  <div key={group.key} className="rounded-xl border border-slate-100 bg-white overflow-hidden">
                    {/* Group header */}
                    <div className="flex items-start gap-3 px-4 py-3">
                      <button
                        onClick={() => setExpandedGroup(isExpanded ? null : group.key)}
                        className="mt-0.5 shrink-0 rounded p-0.5 text-slate-400 transition hover:text-indigo-500"
                        title={isExpanded ? 'Collapse' : 'Expand to see recipients'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="flex-1 min-w-0">
                        {group.title && (
                          <p className="text-sm font-bold text-slate-800">{group.title}</p>
                        )}
                        <p className="text-sm text-slate-600">{group.message}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Sent to {group.items.length} user{group.items.length > 1 ? 's' : ''} &middot;{' '}
                          {group.createdAt ? new Date(group.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => {
                            setEditingId(representative.id)
                            setEditTitle(representative.title || '')
                            setEditMessage(representative.message || '')
                          }}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-500"
                          title="Edit notification"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await Promise.all(group.items.map((item) => deleteNotification(item.id)))
                              setSentNotifications((prev) => {
                                const ids = new Set(group.items.map((item) => item.id))
                                return prev.filter((item) => !ids.has(item.id))
                              })
                            } catch {
                              /* ignore */
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                          title="Delete all in this group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Edit mode for representative */}
                    {editingId === representative.id && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          placeholder="Title (optional)"
                        />
                        <textarea
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          placeholder="Message"
                        />
                        <div className="flex gap-2">
                          <button
                            disabled={editSaving || !editMessage.trim()}
                            onClick={async () => {
                              setEditSaving(true)
                              try {
                                const results = await Promise.all(
                                  group.items.map((item) =>
                                    updateNotification(item.id, editTitle.trim(), editMessage.trim())
                                  )
                                )
                                setSentNotifications((prev) => {
                                  const updatedMap = new Map(results.map((r) => [r.id, r]))
                                  return prev.map((item) => updatedMap.get(item.id) || item)
                                })
                                setEditingId(null)
                              } catch {
                                /* ignore */
                              } finally {
                                setEditSaving(false)
                              }
                            }}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {editSaving ? 'Saving…' : `Save (updates ${group.items.length} notification${group.items.length > 1 ? 's' : ''})`}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded recipients */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Recipients</p>
                        {group.items.map((n) => (
                          <div key={n.id} className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs hover:bg-white transition">
                            <span className="text-slate-600 font-mono">{n.userId}</span>
                            <button
                              onClick={async () => {
                                try {
                                  await deleteNotification(n.id)
                                  setSentNotifications((prev) => prev.filter((item) => item.id !== n.id))
                                } catch {
                                  /* ignore */
                                }
                              }}
                              className="rounded p-1 text-slate-300 transition hover:text-red-500"
                              title="Remove this recipient"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
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

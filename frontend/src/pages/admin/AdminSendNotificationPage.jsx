import { useEffect, useState } from 'react'
import { postJson, getJson, putJson, deleteJson } from '../../services/api.js'

export default function AdminSendNotificationPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('all')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [broadcasts, setBroadcasts] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadBroadcasts()
  }, [])

  async function loadBroadcasts() {
    setHistoryLoading(true)
    try {
      const data = await getJson('/api/notifications/broadcasts')
      setBroadcasts(Array.isArray(data) ? data : [])
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setStatus('')
    setError('')

    try {
      const body = {
        title: title.trim() || null,
        message: message.trim(),
        type: 'GENERAL',
      }
      const result = await postJson('/api/notifications/broadcast', body)
      const count = Array.isArray(result) ? result.length : 0
      setStatus(`Notification sent to ${count} user${count !== 1 ? 's' : ''} successfully!`)
      setTitle('')
      setMessage('')
      loadBroadcasts()
    } catch (err) {
      setError(err?.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  function formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleString()
  }

  function startEdit(b) {
    setEditingId(b.broadcastId)
    setEditTitle(b.title || '')
    setEditMessage(b.message || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditMessage('')
  }

  async function saveEdit(broadcastId) {
    if (!editMessage.trim()) return
    setEditSaving(true)
    try {
      await putJson(`/api/notifications/broadcasts/${broadcastId}`, {
        title: editTitle.trim() || null,
        message: editMessage.trim(),
      })
      setEditingId(null)
      loadBroadcasts()
    } catch {
      // ignore
    } finally {
      setEditSaving(false)
    }
  }

  async function handleDelete(broadcastId) {
    if (!window.confirm('Delete this notification for all recipients?')) return
    setDeletingId(broadcastId)
    try {
      await deleteJson(`/api/notifications/broadcasts/${broadcastId}`)
      setBroadcasts((prev) => prev.filter((b) => b.broadcastId !== broadcastId))
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Send notification card */}
      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Admin
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          Send notification
        </h2>

        <form onSubmit={handleSend} className="mt-6 space-y-5">
          <div>
            <label htmlFor="notif-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Title
            </label>
            <input
              id="notif-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title (optional)"
              maxLength={200}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-4 text-sm outline-none ring-indigo-500/20 focus:ring-4 focus:border-indigo-300 transition"
            />
          </div>

          <div>
            <label htmlFor="notif-message" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Message
            </label>
            <textarea
              id="notif-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your notification message..."
              required
              minLength={2}
              maxLength={2000}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-4 text-sm outline-none ring-indigo-500/20 focus:ring-4 focus:border-indigo-300 transition resize-y"
            />
          </div>

          {/* Audience toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAudience('all')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                audience === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All users
            </button>
            <button
              type="button"
              onClick={() => setAudience('select')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                audience === 'select'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Select users
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {status && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send notification'}
          </button>
        </form>
      </section>

      {/* Sent notifications history */}
      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Admin
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
          Sent notifications
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          History of manually sent notifications.
        </p>

        <div className="mt-6">
          {historyLoading ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-8 text-center text-sm text-gray-400">
              Loading…
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-8 text-center text-sm italic text-gray-400">
              No sent notifications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div
                  key={b.broadcastId || b.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
                >
                  {editingId === b.broadcastId ? (
                    /* Inline edit form */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title (optional)"
                        maxLength={200}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 focus:border-indigo-300 transition"
                      />
                      <textarea
                        rows={3}
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        required
                        minLength={2}
                        maxLength={2000}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 focus:border-indigo-300 transition resize-y"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(b.broadcastId)}
                          disabled={editSaving || !editMessage.trim()}
                          className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-50"
                        >
                          {editSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-full border border-gray-200 bg-white px-5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          {b.title && (
                            <p className="text-sm font-bold text-gray-900">{b.title}</p>
                          )}
                          <p className="mt-0.5 text-sm text-gray-600 break-words">{b.message}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                            {b.audience === 'SELECTED' ? 'Selected' : 'All users'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {b.recipientCount} recipient{b.recipientCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-400">{formatTime(b.createdAt)}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(b)}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(b.broadcastId)}
                            disabled={deletingId === b.broadcastId}
                            className="rounded-xl border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                          >
                            {deletingId === b.broadcastId ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

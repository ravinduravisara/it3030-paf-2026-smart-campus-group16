import { useState } from 'react'
import { AlertTriangle, ClipboardList, ListChecks, Plus, Timer } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useTickets } from '../../hooks/useTickets.js'
import { fetchComments, addComment, updateComment, deleteComment } from '../../api/commentApi.js'
import { fetchTicket } from '../../api/ticketApi.js'
import TicketCard from '../../components/ticket/TicketCard.jsx'
import TicketTable from '../../components/ticket/TicketTable.jsx'
import TicketForm from '../../components/forms/TicketForm.jsx'
import ResolutionPanel from '../../components/ticket/ResolutionPanel.jsx'
import TicketStatusBadge from '../../components/ticket/TicketStatusBadge.jsx'
import CommentForm from '../../components/forms/CommentForm.jsx'
import formatDuration from '../../utils/formatDuration.js'

const TABS = [
  { key: 'my', label: 'My Tickets', icon: ClipboardList },
  { key: 'create', label: 'New Ticket', icon: Plus },
]

const ADMIN_TABS = [
  ...TABS,
  { key: 'manage', label: 'Manage Tickets', icon: ListChecks },
]

const STATUS_OPTIONS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

export default function TicketsOverviewPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const tabs = isAdmin ? ADMIN_TABS : TABS

  const [tab, setTab] = useState('my')
  const [statusFilter, setStatusFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState('')
  const [statusTicket, setStatusTicket] = useState(null)
  const [assignTicketObj, setAssignTicketObj] = useState(null)
  const [assignTo, setAssignTo] = useState('')
  const [detailTicket, setDetailTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [editingComment, setEditingComment] = useState(null)
  const [editText, setEditText] = useState('')
  const [editError, setEditError] = useState('')
  const [assignError, setAssignError] = useState('')

  const filters = tab === 'manage' && statusFilter ? { status: statusFilter } : undefined
  const { tickets, loading, error, reload, create, statusUpdate, assign } = useTickets(filters)

  async function handleCreate(data) {
    setCreating(true)
    setActionError('')
    try {
      await create(data)
      setTab('my')
    } catch (err) {
      throw err
    } finally {
      setCreating(false)
    }
  }

  async function handleStatusSubmit(id, data) {
    setActionError('')
    try {
      await statusUpdate(id, data)
    } catch (err) {
      setActionError(extractError(err))
    }
  }

  async function handleAssignSubmit() {
    if (!assignTicketObj) return
    if (!assignTo.trim()) { setAssignError('Assignee username is required.'); return }
    if (assignTo.trim().length < 2) { setAssignError('Username must be at least 2 characters.'); return }
    if (assignTo.trim().length > 100) { setAssignError('Username must not exceed 100 characters.'); return }
    setActionError('')
    setAssignError('')
    try {
      await assign(assignTicketObj.id, assignTo.trim())
      setAssignTicketObj(null)
      setAssignTo('')
      await refreshDetail()
    } catch (err) {
      setActionError(extractError(err))
    }
  }

  async function openDetail(ticket) {
    setDetailTicket(ticket)
    setCommentsLoading(true)
    try {
      const data = await fetchComments(ticket.id)
      setComments(Array.isArray(data) ? data : [])
    } catch {
      setComments([])
    } finally {
      setCommentsLoading(false)
    }
  }

  async function refreshDetail() {
    if (!detailTicket) return
    try {
      const [t, c] = await Promise.all([
        fetchTicket(detailTicket.id),
        fetchComments(detailTicket.id),
      ])
      setDetailTicket(t)
      setComments(Array.isArray(c) ? c : [])
    } catch { /* ignore */ }
  }

  async function handleAddComment(text) {
    if (!detailTicket) return
    await addComment(detailTicket.id, text)
    const data = await fetchComments(detailTicket.id)
    setComments(Array.isArray(data) ? data : [])
  }

  async function handleUpdateComment(commentId, text) {
    const trimmed = text.trim()
    if (!trimmed) { setEditError('Comment cannot be empty.'); return }
    if (trimmed.length > 1000) { setEditError('Comment must not exceed 1000 characters.'); return }
    if (!detailTicket) return
    setEditError('')
    await updateComment(detailTicket.id, commentId, trimmed)
    setEditingComment(null)
    setEditText('')
    const data = await fetchComments(detailTicket.id)
    setComments(Array.isArray(data) ? data : [])
  }

  async function handleDeleteComment(commentId) {
    if (!detailTicket) return
    await deleteComment(detailTicket.id, commentId)
    const data = await fetchComments(detailTicket.id)
    setComments(Array.isArray(data) ? data : [])
  }

  return (
    <section id="tickets" className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Tickets</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Maintenance & Incident Tracking</h2>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mt-6 flex gap-1 rounded-2xl bg-gray-100 p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); if (t.key !== 'manage') setStatusFilter(''); setDetailTicket(null) }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {(error || actionError) && (
        <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || actionError}</div>
      )}

      {/* My Tickets */}
      {tab === 'my' && !detailTicket && (
        <div className="mt-6">
          {loading ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading tickets…</p>
          ) : tickets.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white py-16 text-center shadow-sm">
              <AlertTriangle className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No tickets yet. Create one to get started!</p>
              <button onClick={() => setTab('create')} className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                New Ticket
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {tickets.map(t => <TicketCard key={t.id} ticket={t} onSelect={openDetail} />)}
            </div>
          )}
        </div>
      )}

      {/* Create Ticket */}
      {tab === 'create' && (
        <div className="mt-6 mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Report an Issue</h3>
          <p className="mb-6 text-sm text-gray-500">Describe the maintenance or incident issue.</p>
          <TicketForm onSubmit={handleCreate} loading={creating} />
        </div>
      )}

      {/* Admin Manage */}
      {tab === 'manage' && isAdmin && !detailTicket && (
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s === 'ALL' ? '' : s)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  (s === 'ALL' && !statusFilter) || statusFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          {loading ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading tickets…</p>
          ) : (
            <TicketTable
              tickets={tickets}
              onSelect={openDetail}
              onAssign={t => { setAssignTicketObj(t); setAssignTo('') }}
              onStatusChange={setStatusTicket}
            />
          )}
        </div>
      )}

      {/* Ticket Detail View */}
      {detailTicket && (
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <button onClick={() => { setDetailTicket(null); reload() }} className="mb-4 text-sm font-semibold text-indigo-600 hover:underline">
            ← Back to list
          </button>

          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold text-gray-900">{detailTicket.title}</h3>
            <TicketStatusBadge status={detailTicket.status} />
          </div>

          <p className="mt-3 text-sm text-gray-600">{detailTicket.description}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500 sm:grid-cols-4">
            <div><span className="font-semibold text-gray-700">Category:</span> {detailTicket.category}</div>
            <div><span className="font-semibold text-gray-700">Priority:</span> {detailTicket.priority}</div>
            <div><span className="font-semibold text-gray-700">Location:</span> {detailTicket.location || '-'}</div>
            <div><span className="font-semibold text-gray-700">Created By:</span> {detailTicket.createdBy}</div>
            {detailTicket.assignedTo && <div><span className="font-semibold text-gray-700">Assigned To:</span> {detailTicket.assignedTo}</div>}
            {detailTicket.resourceName && <div><span className="font-semibold text-gray-700">Resource:</span> {detailTicket.resourceName}</div>}
            {detailTicket.contactInfo && <div><span className="font-semibold text-gray-700">Contact:</span> {detailTicket.contactInfo}</div>}
            {detailTicket.createdAt && <div><span className="font-semibold text-gray-700">Created:</span> {new Date(detailTicket.createdAt).toLocaleString()}</div>}
          </div>

          {/* SLA Timers */}
          {(detailTicket.timeToFirstResponseMs != null || detailTicket.timeToResolutionMs != null) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {detailTicket.timeToFirstResponseMs != null && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700">First Response</p>
                    <p className="text-sm font-bold text-blue-900">{formatDuration(detailTicket.timeToFirstResponseMs)}</p>
                  </div>
                </div>
              )}
              {detailTicket.timeToResolutionMs != null && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5">
                  <Timer className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Resolution Time</p>
                    <p className="text-sm font-bold text-emerald-900">{formatDuration(detailTicket.timeToResolutionMs)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {detailTicket.resolutionNotes && (
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <span className="font-semibold">Resolution:</span> {detailTicket.resolutionNotes}
            </div>
          )}
          {detailTicket.rejectionReason && (
            <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <span className="font-semibold">Rejected:</span> {detailTicket.rejectionReason}
            </div>
          )}

          {detailTicket.attachments?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-700">Attachments:</p>
              <div className="mt-2 flex gap-3">
                {detailTicket.attachments.map((a, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-2">
                    {a.base64Data ? (
                      <img src={`data:${a.contentType};base64,${a.base64Data}`} alt={a.fileName} className="h-20 w-20 rounded object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">{a.fileName}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin actions */}
          {isAdmin && detailTicket.status !== 'CLOSED' && detailTicket.status !== 'REJECTED' && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStatusTicket(detailTicket)}
                className="rounded-xl bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-100"
              >
                Update Status
              </button>
              <button
                onClick={() => { setAssignTicketObj(detailTicket); setAssignTo('') }}
                className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
              >
                Assign
              </button>
            </div>
          )}

          {/* Comments */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h4 className="text-sm font-bold text-gray-900">Comments</h4>
            {commentsLoading ? (
              <p className="mt-3 text-xs text-gray-400">Loading comments…</p>
            ) : comments.length === 0 ? (
              <p className="mt-3 text-xs text-gray-400">No comments yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{c.authorUsername}</span>
                      <span className="text-xs text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                    </div>
                    {editingComment === c.id ? (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-2">
                          <input
                            value={editText}
                            onChange={e => { setEditText(e.target.value); setEditError('') }}
                            maxLength={1000}
                            className={`flex-1 rounded-lg border px-3 py-1.5 text-sm ${editError ? 'border-rose-300' : 'border-gray-200'}`}
                          />
                          <button onClick={() => handleUpdateComment(c.id, editText)} disabled={!editText.trim()} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white disabled:opacity-50">Save</button>
                          <button onClick={() => { setEditingComment(null); setEditText(''); setEditError('') }} className="text-xs text-gray-500">Cancel</button>
                        </div>
                        <div className="flex justify-between">
                          {editError ? <p className="text-xs text-rose-600">{editError}</p> : <span />}
                          <span className="text-xs text-gray-400">{editText.length}/1000</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-gray-600">{c.text}</p>
                        {(isAdmin || c.authorUsername === user?.username) && (
                          <div className="mt-2 flex gap-2">
                            <button onClick={() => { setEditingComment(c.id); setEditText(c.text) }} className="text-xs text-indigo-600 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-rose-600 hover:underline">Delete</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <CommentForm onSubmit={handleAddComment} />
            </div>
          </div>
        </div>
      )}

      {/* Status update modal */}
      {statusTicket && (
        <ResolutionPanel
          ticket={statusTicket}
          onSubmit={async (id, data) => { await handleStatusSubmit(id, data); await refreshDetail() }}
          onClose={() => setStatusTicket(null)}
        />
      )}

      {/* Assign modal */}
      {assignTicketObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Assign Ticket</h3>
            <p className="mt-1 text-sm text-gray-500">Assign "{assignTicketObj.title}" to a technician or user.</p>
            <input
              value={assignTo}
              onChange={e => { setAssignTo(e.target.value); setAssignError('') }}
              placeholder="Username of assignee"
              maxLength={100}
              className={`mt-4 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                assignError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100'
              }`}
            />
            {assignError && <p className="mt-1 text-xs text-rose-600">{assignError}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => { setAssignTicketObj(null); setAssignError('') }} className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAssignSubmit} disabled={!assignTo.trim()} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">Assign</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function extractError(err) {
  try {
    const data = JSON.parse(err.message)
    return data.error || data.message || err.message
  } catch {
    return err.message || 'Something went wrong'
  }
}


import { useState } from 'react'

const TRANSITIONS = {
  OPEN: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED', 'OPEN'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
}

export default function ResolutionPanel({ ticket, onSubmit, onClose }) {
  const [status, setStatus] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const options = TRANSITIONS[ticket.status] || []

  async function handleSubmit(e) {
    e.preventDefault()
    if (!status) {
      setError('Please select a new status')
      return
    }
    if (status === 'REJECTED') {
      if (!rejectionReason.trim()) {
        setError('Rejection reason is required')
        return
      }
      if (rejectionReason.trim().length < 5) {
        setError('Rejection reason must be at least 5 characters')
        return
      }
      if (rejectionReason.trim().length > 500) {
        setError('Rejection reason must not exceed 500 characters')
        return
      }
    }
    if (status === 'RESOLVED' && resolutionNotes.trim().length > 2000) {
      setError('Resolution notes must not exceed 2000 characters')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onSubmit(ticket.id, {
        status,
        resolutionNotes: status === 'RESOLVED' ? resolutionNotes : undefined,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      })
      onClose()
    } catch (err) {
      setError(extractError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">Update Ticket Status</h3>
        <p className="mt-1 text-sm text-gray-500">Current: {ticket.status?.replace('_', ' ')}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">New Status *</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select status</option>
              {options.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {status === 'RESOLVED' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Resolution Notes</label>
              <textarea
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                rows={3}
                maxLength={2000}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Describe how the issue was resolved"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{resolutionNotes.length}/2000</p>
            </div>
          )}

          {status === 'REJECTED' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                maxLength={500}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                  error && !rejectionReason.trim() ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100'
                }`}
                placeholder="Reason for rejecting this ticket (min 5 characters)"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{rejectionReason.length}/500</p>
            </div>
          )}

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !status}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {busy ? 'Updating…' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
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

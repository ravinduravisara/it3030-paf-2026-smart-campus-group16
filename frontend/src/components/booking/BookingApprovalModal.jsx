import { useState } from 'react'

export default function BookingApprovalModal({ booking, onClose, onSubmit }) {
  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!booking) return null

  async function handleSubmit() {
    setError('')
    if (!action) {
      setError('Please select an action.')
      return
    }
    if (reason.length > 500) {
      setError('Reason must not exceed 500 characters.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(booking.id, action, reason)
      onClose()
    } catch (err) {
      try {
        const data = JSON.parse(err.message)
        setError(data.error || data.message || err.message)
      } catch {
        setError(err.message || 'Something went wrong')
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">Review Booking</h2>
        <p className="mt-1 text-sm text-gray-500">
          {booking.resourceName || booking.resourceId} — {booking.date} {booking.startTime}–{booking.endTime}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          <span className="font-medium">Requested by:</span> {booking.requestedBy}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          <span className="font-medium">Purpose:</span> {booking.purpose}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setAction('APPROVE')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              action === 'APPROVE' ? 'bg-emerald-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Approve
          </button>
          <button
            onClick={() => setAction('REJECT')}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              action === 'REJECT' ? 'bg-rose-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Reject
          </button>
        </div>

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason (optional, max 500 characters)"
          rows={3}
          maxLength={500}
          className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{reason.length}/500</p>

        {error && (
          <div className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!action || submitting}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

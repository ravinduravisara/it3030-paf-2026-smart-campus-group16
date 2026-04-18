import { useState } from 'react'

export default function BookingApprovalModal({ booking, onClose, onSubmit }) {
  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!booking) return null

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await onSubmit(booking.id, action, reason)
      onClose()
    } catch {
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
          placeholder="Reason (optional)"
          rows={3}
          className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />

        <div className="mt-6 flex justify-end gap-3">
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

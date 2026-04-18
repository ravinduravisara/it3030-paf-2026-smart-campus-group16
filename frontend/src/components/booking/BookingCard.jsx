import { Clock3, UserCheck, ClipboardList, XCircle } from 'lucide-react'
import BookingStatusBadge from './BookingStatusBadge.jsx'

const icons = {
  PENDING: Clock3,
  APPROVED: UserCheck,
  REJECTED: XCircle,
  CANCELLED: ClipboardList,
}

export default function BookingCard({ booking, onCancel, isAdmin, onDecide }) {
  const Icon = icons[booking.status] || Clock3

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {booking.resourceName || booking.resourceId}
          </h3>
          <p className="text-sm text-gray-500">by {booking.requestedBy}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-4 space-y-1 text-sm text-gray-600">
        <p><span className="font-medium text-gray-700">Date:</span> {booking.date}</p>
        <p><span className="font-medium text-gray-700">Time:</span> {booking.startTime} – {booking.endTime}</p>
        <p><span className="font-medium text-gray-700">Purpose:</span> {booking.purpose}</p>
        {booking.expectedAttendees != null && (
          <p><span className="font-medium text-gray-700">Attendees:</span> {booking.expectedAttendees}</p>
        )}
      </div>

      {booking.decisionReason && (
        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
          <span className="font-medium">Reason:</span> {booking.decisionReason}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {isAdmin && booking.status === 'PENDING' && onDecide && (
          <>
            <button
              onClick={() => onDecide(booking.id, 'APPROVE')}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              onClick={() => onDecide(booking.id, 'REJECT')}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              Reject
            </button>
          </>
        )}
        {booking.status === 'APPROVED' && onCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel Booking
          </button>
        )}
        {isAdmin && booking.status === 'PENDING' && onCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

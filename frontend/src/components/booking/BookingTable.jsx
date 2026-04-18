import BookingStatusBadge from './BookingStatusBadge.jsx'

export default function BookingTable({ bookings, isAdmin, onDecide, onCancel }) {
  if (bookings.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-400">No bookings found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-3 text-left">Resource</th>
            <th className="px-6 py-3 text-left">Requested By</th>
            <th className="px-6 py-3 text-left">Date</th>
            <th className="px-6 py-3 text-left">Time</th>
            <th className="px-6 py-3 text-left">Purpose</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map(b => (
            <tr key={b.id} className="hover:bg-gray-50/50">
              <td className="px-6 py-4 font-medium text-gray-900">{b.resourceName || b.resourceId}</td>
              <td className="px-6 py-4 text-gray-600">{b.requestedBy}</td>
              <td className="px-6 py-4 text-gray-600">{b.date}</td>
              <td className="px-6 py-4 text-gray-600">{b.startTime} – {b.endTime}</td>
              <td className="max-w-[200px] truncate px-6 py-4 text-gray-600">{b.purpose}</td>
              <td className="px-6 py-4"><BookingStatusBadge status={b.status} /></td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {isAdmin && b.status === 'PENDING' && onDecide && (
                    <>
                      <button
                        onClick={() => onDecide(b.id, 'APPROVE')}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onDecide(b.id, 'REJECT')}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.status === 'APPROVED' && onCancel && (
                    <button
                      onClick={() => onCancel(b.id)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

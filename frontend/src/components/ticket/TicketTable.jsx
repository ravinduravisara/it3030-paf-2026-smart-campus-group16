import TicketStatusBadge from './TicketStatusBadge.jsx'

export default function TicketTable({ tickets, onSelect, onAssign, onStatusChange }) {
  if (!tickets.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center shadow-sm">
        <p className="text-sm text-gray-500">No tickets found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50/50">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Priority</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Created By</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Assigned To</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {tickets.map(t => (
            <tr key={t.id} className="hover:bg-gray-50/50">
              <td
                className="cursor-pointer px-4 py-3 font-medium text-indigo-600 hover:underline"
                onClick={() => onSelect?.(t)}
              >
                {t.title}
              </td>
              <td className="px-4 py-3 text-gray-600">{t.category || '-'}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold ${t.priority === 'HIGH' ? 'text-rose-600' : t.priority === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {t.priority}
                </span>
              </td>
              <td className="px-4 py-3"><TicketStatusBadge status={t.status} /></td>
              <td className="px-4 py-3 text-gray-600">{t.createdBy}</td>
              <td className="px-4 py-3 text-gray-600">{t.assignedTo || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {onAssign && t.status !== 'CLOSED' && t.status !== 'REJECTED' && (
                    <button
                      onClick={() => onAssign(t)}
                      className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                    >
                      Assign
                    </button>
                  )}
                  {onStatusChange && t.status !== 'CLOSED' && t.status !== 'REJECTED' && (
                    <button
                      onClick={() => onStatusChange(t)}
                      className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-100"
                    >
                      Update
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

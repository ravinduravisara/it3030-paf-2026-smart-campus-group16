const COLORS = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  REJECTED: 'bg-rose-100 text-rose-700',
}

export default function TicketStatusBadge({ status }) {
  const cls = COLORS[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {status?.replace('_', ' ') || 'UNKNOWN'}
    </span>
  )
}

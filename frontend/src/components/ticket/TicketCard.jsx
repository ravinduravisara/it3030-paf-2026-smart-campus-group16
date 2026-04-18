import { AlertTriangle, Clock, MapPin, Timer, User } from 'lucide-react'
import TicketStatusBadge from './TicketStatusBadge.jsx'
import formatDuration from '../../utils/formatDuration.js'

const PRIORITY_COLORS = {
  HIGH: 'text-rose-600',
  MEDIUM: 'text-amber-600',
  LOW: 'text-emerald-600',
}

export default function TicketCard({ ticket, onSelect }) {
  return (
    <div
      onClick={() => onSelect?.(ticket)}
      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{ticket.title}</h3>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{ticket.description}</p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        {ticket.priority && (
          <span className={`flex items-center gap-1 font-semibold ${PRIORITY_COLORS[ticket.priority] || ''}`}>
            <AlertTriangle className="h-3 w-3" />
            {ticket.priority}
          </span>
        )}
        {ticket.category && (
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600">{ticket.category}</span>
        )}
        {ticket.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {ticket.location}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {ticket.createdBy}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
        </span>
      </div>

      {ticket.assignedTo && (
        <p className="mt-2 text-xs text-indigo-600">Assigned to: {ticket.assignedTo}</p>
      )}

      {(ticket.timeToFirstResponseMs != null || ticket.timeToResolutionMs != null) && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {ticket.timeToFirstResponseMs != null && (
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-600">
              <Timer className="h-3 w-3" /> Response: {formatDuration(ticket.timeToFirstResponseMs)}
            </span>
          )}
          {ticket.timeToResolutionMs != null && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
              <Timer className="h-3 w-3" /> Resolved: {formatDuration(ticket.timeToResolutionMs)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

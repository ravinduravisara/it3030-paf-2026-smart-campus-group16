import { getJson, postJson, patchJson } from '../services/api.js'

export function fetchTickets(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.priority) params.set('priority', filters.priority)
  if (filters.category) params.set('category', filters.category)
  if (filters.assignedTo) params.set('assignedTo', filters.assignedTo)
  const qs = params.toString()
  return getJson(`/api/tickets${qs ? '?' + qs : ''}`)
}

export function fetchTicket(id) {
  return getJson(`/api/tickets/${id}`)
}

export function createTicket(data) {
  return postJson('/api/tickets', data)
}

export function updateTicketStatus(id, data) {
  return patchJson(`/api/tickets/${id}/status`, data)
}

export function assignTicket(id, assignedTo) {
  return patchJson(`/api/tickets/${id}/assign`, { assignedTo })
}

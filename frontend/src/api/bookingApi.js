import { getJson, postJson, patchJson } from '../services/api.js'

export function fetchBookings(status) {
  const params = status ? `?status=${status}` : ''
  return getJson(`/api/bookings${params}`)
}

export function fetchBooking(id) {
  return getJson(`/api/bookings/${id}`)
}

export function createBooking(data) {
  return postJson('/api/bookings', data)
}

export function decideBooking(id, action, reason) {
  return patchJson(`/api/bookings/${id}/decide`, { action, reason })
}

export function cancelBooking(id, reason) {
  return patchJson(`/api/bookings/${id}/cancel`, { reason })
}

import { getJson, patchJson, deleteJson } from '../services/api.js'

export function fetchMyNotifications() {
  return getJson('/api/notifications/my')
}

export function markNotificationRead(id) {
  return patchJson(`/api/notifications/${id}/read`)
}

export function dismissNotification(id) {
  return deleteJson(`/api/notifications/${id}`)
}

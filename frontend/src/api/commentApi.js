import { getJson, postJson, putJson, deleteJson } from '../services/api.js'

export function fetchComments(ticketId) {
  return getJson(`/api/tickets/${ticketId}/comments`)
}

export function addComment(ticketId, text) {
  return postJson(`/api/tickets/${ticketId}/comments`, { text })
}

export function updateComment(ticketId, commentId, text) {
  return putJson(`/api/tickets/${ticketId}/comments/${commentId}`, { text })
}

export function deleteComment(ticketId, commentId) {
  return deleteJson(`/api/tickets/${ticketId}/comments/${commentId}`)
}

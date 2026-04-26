import { clearSession, getAccessToken } from './tokenService.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function buildHeaders(options = {}) {
	const headers = new Headers(options.headers || {})
	const token = getAccessToken()

	if (token) {
		headers.set('Authorization', `Bearer ${token}`)
	}

	if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json')
	}

	return headers
}

async function request(path, options = {}) {
	const res = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: buildHeaders(options),
		credentials: 'include',
	})

	if (!res.ok) {
		if (res.status === 401) {
			clearSession()
			window.location.hash = '#login'
			throw new Error('Session expired. Please log in again.')
		}
		const text = await res.text().catch(() => '')
		throw new Error(text || `Request failed: ${res.status}`)
	}

	if (res.status === 204) return null

	const contentType = res.headers.get('content-type') || ''
	if (contentType.includes('application/json')) {
		return res.json()
	}

	return res.text()
}

export function getJson(path) {
	return request(path)
}

export function postJson(path, body) {
	return request(path, {
		method: 'POST',
		body: JSON.stringify(body ?? {}),
	})
}

export function putJson(path, body) {
	return request(path, {
		method: 'PUT',
		body: JSON.stringify(body ?? {}),
	})
}

export function patchJson(path, body) {
	return request(path, {
		method: 'PATCH',
		body: JSON.stringify(body ?? {}),
	})
}

export function deleteJson(path) {
	return request(path, {
		method: 'DELETE',
	})
}

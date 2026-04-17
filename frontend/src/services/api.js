function resolveApiBaseUrl() {
	const configured = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')
	if (configured) return configured

	if (typeof window === 'undefined') return ''

	const protocol = window.location.protocol
	const hostname = window.location.hostname
	const port = window.location.port
	const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1'

	// If opened directly from disk (file://), relative /api requests fail.
	if (protocol === 'file:' || !hostname) return 'http://localhost:8080'

	// In Vite dev mode we rely on the /api proxy.
	if (import.meta.env.DEV) return ''

	// For local preview/static hosting (for example :4173), call backend directly.
	if (isLocalHost && port !== '8080') return 'http://localhost:8080'

	return ''
}

const API_BASE_URL = resolveApiBaseUrl()

function buildApiUrl(path) {
	const normalizedPath = String(path || '')
	return `${API_BASE_URL}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`
}

async function request(path, options) {
	const url = buildApiUrl(path)
	const hasBody = options?.body != null
	const headers = {
		...(hasBody ? { 'Content-Type': 'application/json' } : {}),
		...(options?.headers || {}),
	}

	let res
	try {
		res = await fetch(url, { ...options, headers })
	} catch (err) {
		console.error('[api] fetch failed →', url, err)
		throw new Error(
			`Unable to reach the API server (${err?.message || 'network error'}). URL: ${url}`,
		)
	}

	if (!res.ok) {
		const text = await res.text().catch(() => '')
		throw new Error(text || `Request failed: ${res.status}`)
	}

	// 204 No Content
	if (res.status === 204) return null
	return res.json()
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

export function deleteJson(path) {
	return request(path, {
		method: 'DELETE',
	})
}

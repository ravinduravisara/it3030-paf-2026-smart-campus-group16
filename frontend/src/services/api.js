const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options) {
	const res = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(options?.headers || {}),
		},
		...options,
	})

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

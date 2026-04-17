const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function extractError(res, fallbackMessage) {
	const text = await res.text().catch(() => '')
	if (!text) return fallbackMessage

	try {
		const parsed = JSON.parse(text)
		return parsed?.message || parsed?.error || fallbackMessage
	} catch {
		return text
	}
}

async function tryBackendLogin({ username, password }) {
	const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
		credentials: 'include',
	})

	if (!res.ok) {
		throw new Error(await extractError(res, 'Login failed'))
	}

	const data = await res.json()
	return {
		token: data.token,
		user: {
			name: data.name || data.username,
			username: data.username,
			email: data.email || data.username,
			role: data.role,
		},
	}
}

export async function signIn({ email, username, password } = {}) {
	const resolvedUsername = String(username || email || '').trim()
	const resolvedPassword = String(password || '').trim()

	if (!resolvedUsername || !resolvedPassword) {
		throw new Error('Username and password are required')
	}

	return tryBackendLogin({ username: resolvedUsername, password: resolvedPassword })
}

async function tryBackendSignup({ studentId, name, email, password, profilePhoto }) {
	const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ studentId, name, email, password, profilePhoto }),
		credentials: 'include',
	})

	if (!res.ok) {
		throw new Error(await extractError(res, 'Signup failed'))
	}

	const data = await res.json()
	return {
		token: data.token,
		user: {
			name: data.name || name,
			username: data.username,
			email: data.email || data.username,
			role: data.role,
		},
	}
}

export async function signUp({ studentId, name, email, password, profilePhoto }) {
	return tryBackendSignup({ studentId, name, email, password, profilePhoto })
}

export async function signInAsAdmin() {
	return signIn({ username: 'admin', password: 'admin123' })
}

export async function signInAsUser() {
	return signIn({ username: 'user', password: 'user123' })
}

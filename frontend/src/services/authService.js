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

async function postJson(path, payload, fallbackMessage) {
	const res = await fetch(`${API_BASE_URL}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		credentials: 'include',
	})

	if (!res.ok) {
		throw new Error(await extractError(res, fallbackMessage))
	}

	return res.json()
}

function mapAuthPayload(data, fallbackName = '') {
	return {
		token: data.token,
		message: data.message,
		user: {
			name: data.name || fallbackName || data.username,
			username: data.username || fallbackName,
			email: data.email || data.username || '',
			role: data.role || 'USER',
		},
	}
}

async function tryBackendLogin({ username, password }) {
	const data = await postJson('/api/auth/login', { username, password }, 'Login failed')
	return mapAuthPayload(data)
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
	const data = await postJson(
		'/api/auth/signup',
		{ studentId, name, email, password, profilePhoto },
		'Signup failed',
	)
	return mapAuthPayload(data, name)
}

export async function signUp({ studentId, name, email, password, profilePhoto }) {
	return tryBackendSignup({ studentId, name, email, password, profilePhoto })
}

export async function verifyOtp({ email, otp }) {
	const data = await postJson('/api/auth/verify-otp', { email, otp }, 'OTP verification failed')
	return mapAuthPayload(data)
}

export async function resendOtp({ email }) {
	const data = await postJson('/api/auth/resend-otp', { email }, 'Resending OTP failed')
	return {
		message: data.message,
	}
}

export async function signInAsAdmin() {
	return signIn({ username: 'admin', password: 'admin123' })
}

export async function signInAsUser() {
	return signIn({ username: 'user', password: 'user123' })
}

import { postJson } from './api.js'

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
	const data = await postJson('/api/auth/login', { username, password })
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
	const data = await postJson('/api/auth/signup', {
		studentId,
		name,
		email,
		password,
		profilePhoto,
	})
	return mapAuthPayload(data, name)
}

export async function signUp({ studentId, name, email, password, profilePhoto }) {
	return tryBackendSignup({ studentId, name, email, password, profilePhoto })
}

export async function verifyOtp({ email, otp }) {
	const data = await postJson('/api/auth/verify-otp', { email, otp })
	return mapAuthPayload(data)
}

export async function resendOtp({ email }) {
	const data = await postJson('/api/auth/resend-otp', { email })
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

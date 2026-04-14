// Placeholder auth implementation (no backend wired yet).

function createFakeToken() {
	return `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`
}


async function tryBackendLogin({ username, password }) {
	const res = await fetch('http://localhost:8080/api/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	})

	if (!res.ok) {
		throw new Error('Login failed')
	}

	const data = await res.json()
	return {
		token: data.token,
		user: {
			username: data.username,
			role: data.role,
		},
	}
}

export async function signIn({ email, username, password } = {}) {
	const resolvedUsername = String(username || email || '').trim()
	const resolvedPassword = String(password || '').trim()

	// If username/password are provided, prefer backend auth.
	if (resolvedUsername && resolvedPassword) {
		try {
			return await tryBackendLogin({ username: resolvedUsername, password: resolvedPassword })
		} catch {
			// Fall back to local placeholder if backend is not running.
		}
	}

	return {
		token: createFakeToken(),
		user: {
			email: resolvedUsername || 'user@campus.edu',
			role: 'USER',
		},
	}
}

export async function signUp({ name, email }) {
	return {
		token: createFakeToken(),
		user: {
			name,
			email,
			role: 'USER',
		},
	}
}

export async function signInAsAdmin() {
	return signIn({ username: 'admin', password: 'admin123' })
}

export async function signInAsUser() {
	return signIn({ username: 'user', password: 'user123' })
}

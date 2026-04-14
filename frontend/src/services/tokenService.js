const TOKEN_KEY = 'sc.accessToken'
const USER_KEY = 'sc.user'

export function getAccessToken() {
	return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token) {
	localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken() {
	localStorage.removeItem(TOKEN_KEY)
}

export function getUser() {
	const raw = localStorage.getItem(USER_KEY)
	if (!raw) return null
	try {
		return JSON.parse(raw)
	} catch {
		return null
	}
}

export function setUser(user) {
	localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser() {
	localStorage.removeItem(USER_KEY)
}

export function clearSession() {
	clearAccessToken()
	clearUser()
}

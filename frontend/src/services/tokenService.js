const TOKEN_KEY = 'sc.accessToken'
const USER_KEY = 'sc.user'

// Helper function to read cookie
function getCookie(name) {
	const nameEQ = name + '='
	const cookies = document.cookie.split(';')
	for (let cookie of cookies) {
		cookie = cookie.trim()
		if (cookie.indexOf(nameEQ) === 0) {
			return decodeURIComponent(cookie.substring(nameEQ.length))
		}
	}
	return null
}

export function getAccessToken() {
	// Try localStorage first, then cookies (for OAuth2)
	return localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_KEY)
}

export function setAccessToken(token) {
	localStorage.setItem(TOKEN_KEY, token)
}

export function clearAccessToken() {
	localStorage.removeItem(TOKEN_KEY)
}

export function getUser() {
	// Try localStorage first, then cookies
	let raw = localStorage.getItem(USER_KEY) || getCookie(USER_KEY)
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

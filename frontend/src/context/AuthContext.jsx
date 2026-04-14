import { createContext, useEffect, useMemo, useState } from 'react'
import {
	clearSession,
	getAccessToken,
	getUser,
	setAccessToken,
	setUser,
} from '../services/tokenService.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
	const [accessToken, setAccessTokenState] = useState(() => getAccessToken())
	const [user, setUserState] = useState(() => getUser())

	const isAuthenticated = Boolean(accessToken)

	function establishSession({ token, user: nextUser }) {
		setAccessToken(token)
		setUser(nextUser)
		setAccessTokenState(token)
		setUserState(nextUser)
	}

	function logout() {
		clearSession()
		setAccessTokenState(null)
		setUserState(null)
	}

	useEffect(() => {
		function onStorage(e) {
			if (e.key === 'sc.accessToken' || e.key === 'sc.user') {
				setAccessTokenState(getAccessToken())
				setUserState(getUser())
			}
		}

		window.addEventListener('storage', onStorage)
		return () => window.removeEventListener('storage', onStorage)
	}, [])

	const value = useMemo(
		() => ({
			isAuthenticated,
			accessToken,
			user,
			establishSession,
			logout,
		}),
		[isAuthenticated, accessToken, user],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

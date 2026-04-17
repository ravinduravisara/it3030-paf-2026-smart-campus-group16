import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { signIn } from '../../services/authService.js'

export default function LoginPage() {
	const { isAuthenticated, user, establishSession, logout } = useAuth()
	const [mode, setMode] = useState('student')
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState('')
	const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
	const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname)
	const googleLoginUrl = isLocalDev
		? `${apiBaseUrl}/api/auth/google/dev`
		: `${apiBaseUrl}/oauth2/authorization/google`
	const oauthError = window.location.hash.includes('error=oauth2')
	const registeredSuccess = window.location.hash.includes('registered=success')

	async function handleSignIn(e) {
		e.preventDefault()
		if (busy) return

		const formData = new FormData(e.currentTarget)
		setBusy(true)
		setError('')

		try {
			if (mode === 'student') {
				const studentIdOrEmail = String(formData.get('studentIdOrEmail') || '').trim()
				const password = String(formData.get('password') || '').trim()
				if (!studentIdOrEmail || !password) {
					throw new Error('Student ID or email and password are required')
				}

				const result = await signIn({ username: studentIdOrEmail, password })
				establishSession(result)
				window.location.hash = '#home'
			} else {
				const username = String(formData.get('username') || '').trim()
				const password = String(formData.get('password') || '').trim()
				if (!username || !password) {
					throw new Error('Username and password are required')
				}

				const result = await signIn({ username, password })
				establishSession(result)
				window.location.hash = result?.user?.role === 'ADMIN' ? '#admin' : '#home'
			}
		} catch (err) {
			setError(err?.message || 'Sign in failed')
		} finally {
			setBusy(false)
		}
	}

	function handleLogout() {
		logout()
		window.location.hash = '#login'
	}

	function handleGoogleLogin() {
		setError('')
		window.location.href = googleLoginUrl
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur">
				<div className="grid gap-0 lg:grid-cols-2">
					<div className="border-b border-gray-200/70 p-6 lg:border-b-0 lg:border-r">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
							{mode === 'student' ? 'Student Login' : 'Admin Login'}
						</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
							Access SmartCampus
						</h2>
						<p className="mt-3 text-sm leading-6 text-gray-600">
							{mode === 'student' ? 'Log in with your Student ID or Email.' : 'Log in as an administrator.'}
						</p>

						{isAuthenticated ? (
							<div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
								<div className="text-sm font-semibold text-emerald-800">You’re signed in</div>
								<div className="mt-1 text-sm text-emerald-700">
									{user?.username || user?.email || 'student'}
								</div>
								<button
									type="button"
									onClick={handleLogout}
									className="mt-4 w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
								>
									Logout
								</button>
							</div>
						) : null}
					</div>

					<div className="p-6">
						{oauthError ? (
							<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								Google OAuth credentials are failing in this local environment. The development sign-in fallback is available from the same button.
							</div>
						) : null}

						{registeredSuccess ? (
							<div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
								Registration successful. Please log in with your new account.
							</div>
						) : null}

						{error ? (
							<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								{error}
							</div>
						) : null}

						<div className="space-y-4">
							<div className="flex items-center gap-2 rounded-2xl bg-gray-50 p-2">
								<button
									type="button"
									onClick={() => setMode('student')}
									className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
										mode === 'student'
											? 'bg-white text-gray-900 shadow-sm'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									Student Login
								</button>
								<button
									type="button"
									onClick={() => setMode('admin')}
									className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
										mode === 'admin'
											? 'bg-white text-gray-900 shadow-sm'
											: 'text-gray-600 hover:text-gray-900'
									}`}
								>
									Admin Login
								</button>
							</div>
							<button
								type="button"
								onClick={handleGoogleLogin}
								className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500"
							>
								Login with Google
							</button>
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="bg-white px-2 text-gray-500">Or continue with</span>
								</div>
							</div>
						</div>
						<form className="space-y-4" onSubmit={handleSignIn}>
							{mode === 'student' ? (
								<>
									<div>
										<label className="text-sm font-medium text-gray-700">Student ID or Email</label>
										<input
											name="studentIdOrEmail"
											type="text"
											placeholder="e.g., 12345 or student@campus.edu"
											required
											className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
										/>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Password</label>
										<input
											name="password"
											type="password"
											placeholder="••••••••"
											required
											className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
										/>
									</div>
								</>
							) : (
								<>
									<div>
										<label className="text-sm font-medium text-gray-700">Username</label>
										<input
											name="username"
											type="text"
											placeholder="admin"
											required
											className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
										/>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-700">Password</label>
										<input
											name="password"
											type="password"
											placeholder="••••••••"
											required
											className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
										/>
									</div>
								</>
							)}
							<button
								type="submit"
								disabled={busy}
								className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
							>
								{busy ? 'Signing in…' : 'Sign in'}
							</button>
						</form>
						<div className="mt-4 text-center">
							<button
								type="button"
								onClick={() => window.location.hash = '#register'}
								className="text-sm text-indigo-600 hover:text-indigo-500"
							>
								Don't have an account? Register here
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

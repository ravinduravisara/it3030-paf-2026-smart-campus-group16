import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { signIn, signInAsAdmin, signInAsUser, signUp } from '../../services/authService.js'

function parseModeFromHash(hash) {
	// Supports: #login?mode=signin | #login?mode=signup
	const raw = (hash || '').replace(/^#/, '')
	const [, queryString = ''] = raw.split('?')
	const params = new URLSearchParams(queryString)
	const mode = params.get('mode')
	return mode === 'signup' ? 'signup' : 'signin'
}

export default function LoginPage() {
	const { isAuthenticated, user, establishSession, logout } = useAuth()
	const initialMode = useMemo(() => parseModeFromHash(window.location.hash), [])
	const [mode, setMode] = useState(initialMode)
	const [busy, setBusy] = useState(false)

	useEffect(() => {
		function onHashChange() {
			setMode(parseModeFromHash(window.location.hash))
		}

		window.addEventListener('hashchange', onHashChange)
		return () => window.removeEventListener('hashchange', onHashChange)
	}, [])

	async function handleSignIn(e) {
		e.preventDefault()
		if (busy) return

		const formData = new FormData(e.currentTarget)
		const username = String(formData.get('username') || '').trim()
		const password = String(formData.get('password') || '').trim()
		if (!username || !password) return

		setBusy(true)
		try {
			const result = await signIn({ username, password })
			establishSession(result)
			window.location.hash = result?.user?.role === 'ADMIN' ? '#admin' : '#home'
		} finally {
			setBusy(false)
		}
	}

	async function handleQuickLogin(kind) {
		if (busy) return
		setBusy(true)
		try {
			const result = kind === 'admin' ? await signInAsAdmin() : await signInAsUser()
			establishSession(result)
			window.location.hash = result?.user?.role === 'ADMIN' ? '#admin' : '#home'
		} finally {
			setBusy(false)
		}
	}

	async function handleSignUp(e) {
		e.preventDefault()
		if (busy) return

		const formData = new FormData(e.currentTarget)
		const name = String(formData.get('name') || '').trim()
		const email = String(formData.get('email') || '').trim()
		if (!name || !email) return

		setBusy(true)
		try {
			const result = await signUp({ name, email })
			establishSession(result)
			window.location.hash = '#home'
		} finally {
			setBusy(false)
		}
	}

	function handleLogout() {
		logout()
		window.location.hash = '#login?mode=signin'
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur">
				<div className="grid gap-0 lg:grid-cols-2">
					<div className="border-b border-gray-200/70 p-6 lg:border-b-0 lg:border-r">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
							Login
						</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
							Access SmartCampus
						</h2>
						<p className="mt-3 text-sm leading-6 text-gray-600">
							Temporary login accounts are enabled.
						</p>
						<div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
							<div className="font-semibold">Temporary credentials</div>
							<div className="mt-1">Admin: <span className="font-mono">admin / admin123</span></div>
							<div>User: <span className="font-mono">user / user123</span></div>
							<div className="mt-2 text-xs text-indigo-700">
								If the backend isn’t running, the app falls back to local placeholder auth.
							</div>
						</div>

						<div className="mt-6 flex items-center gap-2 rounded-2xl bg-gray-50 p-2">
							<button
								type="button"
								onClick={() => setMode('signin')}
								className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
									mode === 'signin'
										? 'bg-white text-gray-900 shadow-sm'
										: 'text-gray-600 hover:text-gray-900'
								}`}
							>
								Sign in
							</button>
							<button
								type="button"
								onClick={() => setMode('signup')}
								className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
									mode === 'signup'
										? 'bg-white text-gray-900 shadow-sm'
										: 'text-gray-600 hover:text-gray-900'
								}`}
							>
								Sign up
							</button>
						</div>

						{isAuthenticated ? (
							<div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
								<div className="text-sm font-semibold text-emerald-800">You’re signed in</div>
								<div className="mt-1 text-sm text-emerald-700">
									{user?.username || user?.email || 'user'}
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
						{mode === 'signin' ? (
							<form className="space-y-4" onSubmit={handleSignIn}>
								<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
									<button
										type="button"
										onClick={() => handleQuickLogin('admin')}
										disabled={busy}
										className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
									>
										Login as Admin
									</button>
									<button
										type="button"
										onClick={() => handleQuickLogin('user')}
										disabled={busy}
										className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
									>
										Login as User
									</button>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-700">Username</label>
									<input
										name="username"
										type="text"
										placeholder="admin or user"
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
								<button
									type="submit"
									disabled={busy}
									className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
								>
									{busy ? 'Signing in…' : 'Sign in'}
								</button>
							</form>
						) : (
							<form className="space-y-4" onSubmit={handleSignUp}>
								<div>
									<label className="text-sm font-medium text-gray-700">Name</label>
									<input
										name="name"
										type="text"
										placeholder="Your name"
										required
										className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
									/>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-700">Email</label>
									<input
										name="email"
										type="email"
										placeholder="name@campus.edu"
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
										className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
									/>
									<p className="mt-2 text-xs text-gray-500">Password is ignored for now.</p>
								</div>
								<button
									type="submit"
									disabled={busy}
									className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
								>
									{busy ? 'Creating account…' : 'Create account'}
								</button>
							</form>
						)}
					</div>
				</div>
			</section>
		</div>
	)
}

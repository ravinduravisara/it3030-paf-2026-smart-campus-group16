import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { signIn } from '../../services/authService.js'

export default function LoginPage() {
	const { isAuthenticated, user, establishSession, logout } = useAuth()
	const [busy, setBusy] = useState(false)

	async function handleSignIn(e) {
		e.preventDefault()
		if (busy) return

		const formData = new FormData(e.currentTarget)
		const studentIdOrEmail = String(formData.get('studentIdOrEmail') || '').trim()
		const password = String(formData.get('password') || '').trim()
		if (!studentIdOrEmail || !password) return

		setBusy(true)
		try {
			const result = await signIn({ username: studentIdOrEmail, password })
			establishSession(result)
			window.location.hash = '#home'
		} finally {
			setBusy(false)
		}
	}

	function handleLogout() {
		logout()
		window.location.hash = '#login'
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur">
				<div className="grid gap-0 lg:grid-cols-2">
					<div className="border-b border-gray-200/70 p-6 lg:border-b-0 lg:border-r">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
							Student Login
						</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
							Access SmartCampus
						</h2>
						<p className="mt-3 text-sm leading-6 text-gray-600">
							Log in with your Student ID or Email.
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
						<form className="space-y-4" onSubmit={handleSignIn}>
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
							<button
								type="submit"
								disabled={busy}
								className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
							>
								{busy ? 'Signing in…' : 'Sign in'}
							</button>
						</form>
					</div>
				</div>
			</section>
		</div>
	)
}

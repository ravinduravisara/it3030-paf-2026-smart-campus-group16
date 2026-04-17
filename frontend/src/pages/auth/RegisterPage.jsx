import { useState } from 'react'
import { signUp } from '../../services/authService.js'

export default function RegisterPage() {
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState('')

	async function handleSignUp(e) {
		e.preventDefault()
		if (busy) return

		const formData = new FormData(e.currentTarget)
		const studentId = String(formData.get('studentId') || '').trim()
		const name = String(formData.get('name') || '').trim()
		const email = String(formData.get('email') || '').trim()
		const password = String(formData.get('password') || '').trim()
		const confirmPassword = String(formData.get('confirmPassword') || '').trim()
		const profilePhotoFile = formData.get('profilePhoto')

		if (!studentId || !name || !email || !password || password !== confirmPassword) {
			setError('Please fill all fields and ensure passwords match.')
			return
		}

		let profilePhoto = null
		if (profilePhotoFile && profilePhotoFile.size > 0) {
			profilePhoto = await toBase64(profilePhotoFile)
		}

		setBusy(true)
		setError('')
		try {
			await signUp({ studentId, name, email, password, profilePhoto })
			window.location.hash = '#login?registered=success'
		} catch (err) {
			setError(err?.message || 'Registration failed')
		} finally {
			setBusy(false)
		}
	}

	function toBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result)
			reader.onerror = error => reject(error)
		})
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur">
				<div className="grid gap-0 lg:grid-cols-2">
					<div className="border-b border-gray-200/70 p-6 lg:border-b-0 lg:border-r">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
							Student Registration
						</p>
						<h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
							Join SmartCampus
						</h2>
						<p className="mt-3 text-sm leading-6 text-gray-600">
							Create your student account.
						</p>
					</div>

					<div className="p-6">
						{error ? (
							<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								{error}
							</div>
						) : null}
						<form className="space-y-4" onSubmit={handleSignUp}>
							<div>
								<label className="text-sm font-medium text-gray-700">Student ID</label>
								<input
									name="studentId"
									type="text"
									placeholder="e.g., 12345"
									required
									className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">Full Name</label>
								<input
									name="name"
									type="text"
									placeholder="Your full name"
									required
									className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">Email</label>
								<input
									name="email"
									type="email"
									placeholder="student@campus.edu"
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
							<div>
								<label className="text-sm font-medium text-gray-700">Confirm Password</label>
								<input
									name="confirmPassword"
									type="password"
									placeholder="••••••••"
									required
									className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
								/>
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">Profile Photo</label>
								<input
									name="profilePhoto"
									type="file"
									accept="image/*"
									className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
								/>
							</div>
							<button
								type="submit"
								disabled={busy}
								className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
							>
								{busy ? 'Creating account…' : 'Register'}
							</button>
						</form>
						<div className="mt-4 text-center">
							<button
								type="button"
								onClick={() => window.location.hash = '#login'}
								className="text-sm text-indigo-600 hover:text-indigo-500"
							>
								Already have an account? Sign in
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
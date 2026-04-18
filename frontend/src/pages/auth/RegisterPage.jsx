import { useState } from 'react'
import { signUp } from '../../services/authService.js'

export default function RegisterPage() {
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState('')
	const [fieldErrors, setFieldErrors] = useState({})
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	function validate(fields) {
		const errs = {}

		if (!fields.studentId) {
			errs.studentId = 'Student ID is required.'
		} else if (!/^IT\d{8}$/.test(fields.studentId)) {
			errs.studentId = 'Student ID must follow the format IT followed by 8 digits (e.g. IT23546134).'
		}

		if (!fields.name) {
			errs.name = 'Full name is required.'
		} else if (fields.name.length < 2) {
			errs.name = 'Name must be at least 2 characters.'
		} else if (fields.name.length > 100) {
			errs.name = 'Name must not exceed 100 characters.'
		}

		if (!fields.email) {
			errs.email = 'Email is required.'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
			errs.email = 'Please enter a valid email address.'
		}

		if (!fields.password) {
			errs.password = 'Password is required.'
		} else if (fields.password.length < 8) {
			errs.password = 'Password must be at least 8 characters.'
		} else if (!/[A-Z]/.test(fields.password)) {
			errs.password = 'Password must contain at least one uppercase letter.'
		} else if (!/[a-z]/.test(fields.password)) {
			errs.password = 'Password must contain at least one lowercase letter.'
		} else if (!/[0-9]/.test(fields.password)) {
			errs.password = 'Password must contain at least one number.'
		} else if (!/[^A-Za-z0-9]/.test(fields.password)) {
			errs.password = 'Password must contain at least one special character.'
		}

		if (!fields.confirmPassword) {
			errs.confirmPassword = 'Please confirm your password.'
		} else if (fields.password !== fields.confirmPassword) {
			errs.confirmPassword = 'Passwords do not match.'
		}

		if (fields.profilePhoto && fields.profilePhoto.size > 0) {
			if (fields.profilePhoto.size > 5 * 1024 * 1024) {
				errs.profilePhoto = 'Photo must not exceed 5 MB.'
			} else if (!fields.profilePhoto.type.startsWith('image/')) {
				errs.profilePhoto = 'Only image files are allowed.'
			}
		}

		return errs
	}

	async function handleSignUp(e) {
		e.preventDefault()
		if (busy) return

		const formData = new FormData(e.currentTarget)
		const studentId = String(formData.get('studentId') || '').trim()
		const name = String(formData.get('name') || '').trim()
		const email = String(formData.get('email') || '').trim()
		const password = String(formData.get('password') || '')
		const confirmPassword = String(formData.get('confirmPassword') || '')
		const profilePhotoFile = formData.get('profilePhoto')

		const errs = validate({ studentId, name, email, password, confirmPassword, profilePhoto: profilePhotoFile })
		setFieldErrors(errs)
		if (Object.keys(errs).length > 0) {
			setError('')
			return
		}

		let profilePhoto = null
		if (profilePhotoFile && profilePhotoFile.size > 0) {
			profilePhoto = await toBase64(profilePhotoFile)
		}

		setBusy(true)
		setError('')
		try {
			const result = await signUp({ studentId, name, email, password, profilePhoto })
			const params = new URLSearchParams({
				email,
				message: result?.message || 'OTP sent. Verify your account to continue.',
			})
			window.location.hash = `#verify-otp?${params.toString()}`
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
									className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${fieldErrors.studentId ? 'border-red-400' : 'border-gray-200'}`}
								/>
								{fieldErrors.studentId && <p className="mt-1 text-xs text-red-600">{fieldErrors.studentId}</p>}
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">Full Name</label>
								<input
									name="name"
									type="text"
									placeholder="Your full name"
									required
									className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${fieldErrors.name ? 'border-red-400' : 'border-gray-200'}`}
								/>
								{fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">Email</label>
								<input
									name="email"
									type="email"
									placeholder="student@campus.edu"
									required
									className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${fieldErrors.email ? 'border-red-400' : 'border-gray-200'}`}
								/>
								{fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">Password</label>
								<div className="relative mt-2">
									<input
										name="password"
										type={showPassword ? 'text' : 'password'}
										placeholder="••••••••"
										required
										className={`w-full rounded-xl border bg-white px-4 py-3 pr-16 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${fieldErrors.password ? 'border-red-400' : 'border-gray-200'}`}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(v => !v)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
									>
										{showPassword ? 'Hide' : 'Show'}
									</button>
								</div>
								{fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">Confirm Password</label>
								<div className="relative mt-2">
									<input
										name="confirmPassword"
										type={showConfirmPassword ? 'text' : 'password'}
										placeholder="••••••••"
										required
										className={`w-full rounded-xl border bg-white px-4 py-3 pr-16 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(v => !v)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
									>
										{showConfirmPassword ? 'Hide' : 'Show'}
									</button>
								</div>
								{fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
							</div>
							<div>
								<label className="text-sm font-medium text-gray-700">Profile Photo</label>
								<input
									name="profilePhoto"
									type="file"
									accept="image/*"
									className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${fieldErrors.profilePhoto ? 'border-red-400' : 'border-gray-200'}`}
								/>
								{fieldErrors.profilePhoto && <p className="mt-1 text-xs text-red-600">{fieldErrors.profilePhoto}</p>}
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
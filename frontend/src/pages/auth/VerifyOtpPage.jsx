import { useState } from 'react'
import { resendOtp, verifyOtp } from '../../services/authService.js'

export default function VerifyOtpPage() {
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState('')
	const hashQuery = window.location.hash.split('?')[1] || ''
	const hashParams = new URLSearchParams(hashQuery)
	const [email, setEmail] = useState(() => hashParams.get('email') || '')
	const [otp, setOtp] = useState('')
	const [info, setInfo] = useState(() => hashParams.get('message') || 'Enter the OTP sent to your email address.')

	async function handleVerifyOtp(e) {
		e.preventDefault()
		if (busy) return

		setBusy(true)
		setError('')
		try {
			await verifyOtp({ email, otp })
			// Account created — redirect to login page
			const params = new URLSearchParams({
				message: 'Account verified successfully! Please log in.',
			})
			window.location.hash = `#login?${params.toString()}`
		} catch (err) {
			setError(err?.message || 'OTP verification failed')
		} finally {
			setBusy(false)
		}
	}

	async function handleResendOtp() {
		if (!email || busy) {
			setError('Email is required to resend OTP.')
			return
		}

		setBusy(true)
		setError('')
		try {
			const result = await resendOtp({ email })
			setInfo(result?.message || 'A new OTP has been sent to your email.')
		} catch (err) {
			setError(err?.message || 'Resending OTP failed')
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
			<section className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-xl backdrop-blur">
				<div className="p-6 sm:p-8">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Verify OTP</p>
					<h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">Activate your account</h2>
					<p className="mt-3 text-sm leading-6 text-gray-600">
						Enter the one-time password sent to your email. You can only sign in after successful OTP verification.
					</p>

					{info ? (
						<div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{info}</div>
					) : null}

					{error ? (
						<div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
					) : null}

					<form className="mt-6 space-y-4" onSubmit={handleVerifyOtp}>
						<div>
							<label className="text-sm font-medium text-gray-700">Email address</label>
							<input
								value={email}
								readOnly
								type="email"
								className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none cursor-not-allowed"
							/>
						</div>

						<div>
							<label className="text-sm font-medium text-gray-700">OTP Code</label>
							<input
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								type="text"
								placeholder="Enter 6-digit OTP"
								required
								className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-amber-500/20 focus:ring-4"
							/>
						</div>

						<div className="flex gap-3">
							<button
								type="submit"
								disabled={busy}
								className="flex-1 rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{busy ? 'Verifying...' : 'Verify OTP'}
							</button>
							<button
								type="button"
								onClick={handleResendOtp}
								disabled={busy}
								className="flex-1 rounded-xl border border-amber-300 bg-white px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
							>
								Resend OTP
							</button>
						</div>
					</form>

					<div className="mt-6 text-center">
						<a href="#login" className="text-sm text-indigo-600 hover:text-indigo-500">Back to Login</a>
					</div>
				</div>
			</section>
		</div>
	)
}

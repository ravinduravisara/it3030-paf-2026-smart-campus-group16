import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.js'

export default function AdminDashboardPage() {
	const { isAuthenticated, user } = useAuth()
	const role = user?.role

	useEffect(() => {
		if (!isAuthenticated) {
			window.location.hash = '#login?mode=signin'
		}
	}, [isAuthenticated])

	if (!isAuthenticated) {
		return null
	}

	if (role !== 'ADMIN') {
		return (
			<section className="mx-auto max-w-3xl rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
				<h2 className="text-2xl font-bold tracking-tight text-gray-900">Access denied</h2>
				<p className="mt-2 text-sm text-gray-600">
					This page is only available for admin accounts.
				</p>
				<a
					href="#home"
					className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
				>
					Go to Home
				</a>
			</section>
		)
	}

	return (
		<div className="space-y-8">
			<header className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
				<p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
					Admin
				</p>
				<h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
					Dashboard
				</h2>
				<p className="mt-2 text-sm leading-6 text-gray-600">
					Manage campus data and review system activity.
				</p>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
					<div className="text-sm font-semibold text-gray-700">Resources</div>
					<div className="mt-1 text-2xl font-bold text-gray-900">Manage</div>
					<a className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800" href="#resources">
						Open
					</a>
				</div>
				<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
					<div className="text-sm font-semibold text-gray-700">Bookings</div>
					<div className="mt-1 text-2xl font-bold text-gray-900">Review</div>
					<a className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800" href="#bookings">
						Open
					</a>
				</div>
				<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
					<div className="text-sm font-semibold text-gray-700">Tickets</div>
					<div className="mt-1 text-2xl font-bold text-gray-900">Handle</div>
					<a className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800" href="#tickets">
						Open
					</a>
				</div>
				<div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur">
					<div className="text-sm font-semibold text-gray-700">Users</div>
					<div className="mt-1 text-2xl font-bold text-gray-900">Monitor</div>
					<span className="mt-4 inline-block text-xs font-semibold text-gray-500">Temporary view</span>
				</div>
			</section>

			<section className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
				<h3 className="text-lg font-bold text-gray-900">Notes</h3>
				<p className="mt-2 text-sm text-gray-600">
					This is a basic admin dashboard shell. Next step would be wiring real admin APIs (counts,
					audit logs, approvals) to these tiles.
				</p>
			</section>
		</div>
	)
}

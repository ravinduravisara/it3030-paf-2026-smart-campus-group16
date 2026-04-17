import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useNotifications } from '../../hooks/useNotifications.js'
import NotificationPanel from './NotificationPanel.jsx'

export default function NotificationBell() {
	const { user } = useAuth()
	const { notifications, unreadCount, loading, markRead, remove } = useNotifications(user?.id)
	const [open, setOpen] = useState(false)
	const ref = useRef(null)

	useEffect(() => {
		function handleClickOutside(e) {
			if (ref.current && !ref.current.contains(e.target)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	if (!user) return null

	return (
		<div className="relative" ref={ref}>
			<button
				onClick={() => setOpen((prev) => !prev)}
				className="relative rounded-xl p-2 text-violet-600 hover:bg-violet-100 transition"
				aria-label="Notifications"
			>
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>

				{unreadCount > 0 && (
					<span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<NotificationPanel
					notifications={notifications}
					loading={loading}
					onMarkRead={markRead}
					onDelete={remove}
				/>
			)}
		</div>
	)
}

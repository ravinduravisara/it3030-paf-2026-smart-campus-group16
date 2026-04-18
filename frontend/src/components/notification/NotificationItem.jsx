export default function NotificationItem({ notification, onMarkRead, onDelete }) {
	const time = notification.createdAt
		? new Date(notification.createdAt).toLocaleString()
		: ''

	return (
		<div
			className={`flex items-start gap-3 rounded-xl px-4 py-3 transition ${
				notification.isRead
					? 'bg-white'
					: 'bg-violet-50 border-l-4 border-violet-400'
			}`}
		>
			<div className="flex-1 min-w-0">
				{notification.title && (
					<p className={`text-sm font-bold ${notification.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
						{notification.title}
					</p>
				)}
				<p className={`text-sm ${notification.isRead ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>
					{notification.message}
				</p>
				<p className="mt-1 text-xs text-slate-400">{time}</p>
			</div>
			<div className="flex items-center gap-1 shrink-0">
				{!notification.isRead && (
					<button
						onClick={() => onMarkRead(notification.id)}
						className="rounded-lg p-1.5 text-violet-500 hover:bg-violet-100 transition"
						title="Mark as read"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</button>
				)}
				<button
					onClick={() => onDelete(notification.id)}
					className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
					title="Delete"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	)
}

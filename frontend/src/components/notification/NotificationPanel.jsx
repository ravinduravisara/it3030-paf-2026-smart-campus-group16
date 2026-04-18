import NotificationItem from './NotificationItem.jsx'

export default function NotificationPanel({ notifications, loading, onMarkRead, onDelete }) {
	return (
		<div className="absolute right-0 top-full mt-2 w-96 max-h-[28rem] overflow-y-auto rounded-2xl border border-violet-200 bg-white shadow-2xl shadow-violet-200/40 z-50">
			<div className="sticky top-0 z-10 border-b border-violet-100 bg-white px-4 py-3">
				<h3 className="text-sm font-bold text-slate-800">Notifications</h3>
			</div>

			{loading && notifications.length === 0 ? (
				<div className="px-4 py-8 text-center text-sm text-slate-400">Loading…</div>
			) : notifications.length === 0 ? (
				<div className="px-4 py-8 text-center text-sm text-slate-400">No notifications</div>
			) : (
				<div className="divide-y divide-slate-100">
					{notifications.map((n) => (
						<NotificationItem
							key={n.id}
							notification={n}
							onMarkRead={onMarkRead}
							onDelete={onDelete}
						/>
					))}
				</div>
			)}
		</div>
	)
}

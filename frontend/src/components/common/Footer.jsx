export default function Footer() {
	return (
		<footer className="border-t bg-white">
			<div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
				<div>© {new Date().getFullYear()} Smart Campus</div>
				<div className="flex gap-4">
					<a className="hover:text-gray-900" href="#features">Features</a>
					<a className="hover:text-gray-900" href="#modules">Modules</a>
					<a className="hover:text-gray-900" href="#status">Status</a>
				</div>
			</div>
		</footer>
	)
}

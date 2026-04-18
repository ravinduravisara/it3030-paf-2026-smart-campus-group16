(function setupRouter() {
	// Minimal client-side router for hash-based navigation
	const routes = {
		'#admin/notification': () => import('../pages/admin/AdminSendNotificationPage.jsx').then(m => m.default),
		// ...add other routes as needed
	};

	async function renderRoute() {
		const hash = window.location.hash;
		const mount = document.getElementById('root');
		if (!mount) return;
		if (routes[hash]) {
			const Page = await routes[hash]();
			// For demo: just replace the root content
			mount.innerHTML = '';
			const el = document.createElement('div');
			mount.appendChild(el);
			// Render React component
			import('react-dom').then(ReactDOM => {
				import('react').then(React => {
					ReactDOM.createRoot(el).render(React.createElement(Page));
				});
			});
		}
	}

	window.addEventListener('hashchange', renderRoute);
	window.addEventListener('DOMContentLoaded', renderRoute);
})();

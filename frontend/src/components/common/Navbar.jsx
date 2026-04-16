import { useAuth } from '../../hooks/useAuth.js'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()

  const isAdmin = user?.role === 'ADMIN'

  const navItems = [
    ...(isAuthenticated && isAdmin ? [{ label: 'Dashboard', href: '#admin' }] : []),
    { label: 'Home', href: '#home' },
    { label: 'Resources', href: '#resources' },
    { label: 'Bookings', href: '#bookings' },
    { label: 'Tickets', href: '#tickets' },
  ]

  function handleLogout() {
    logout()
    window.location.hash = '#home'
  }

  return (
    <header className="sticky top-0 z-50 border-b border-violet-200/70 bg-gradient-to-r from-violet-50/95 via-purple-50/90 to-fuchsia-50/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 shadow-lg shadow-violet-300/40">
            <div className="h-4 w-4 rounded-md bg-white/90" />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              SmartCampus
            </h1>
          </div>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative text-base font-bold text-violet-600 transition hover:text-violet-800"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100/80 px-4 py-2 text-sm font-bold text-emerald-700 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(34,197,94,0.15)]" />
            System Live
          </div>

          {!isAuthenticated ? (
            <a
              href="#login?mode=signin"
              className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-violet-400/30 transition hover:scale-[1.02]"
            >
              Login
            </a>
          ) : (
            <button
              className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 px-6 py-3 text-base font-bold text-white shadow-lg shadow-violet-400/30 transition hover:scale-[1.02]"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
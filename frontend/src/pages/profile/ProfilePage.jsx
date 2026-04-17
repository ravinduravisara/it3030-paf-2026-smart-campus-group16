import { useAuth } from '../../hooks/useAuth.js'

function getInitials(user) {
  const source = String(user?.name || user?.username || user?.email || 'U').trim()
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function ProfilePage() {
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    window.location.hash = '#home'
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400 text-xl font-black text-white shadow-lg shadow-violet-300/40">
            {getInitials(user)}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Your Profile
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {user?.name || user?.username || 'SmartCampus User'}
            </h2>
            <p className="text-sm text-slate-600">
              Manage your account details and access level.
            </p>
          </div>
        </div>

        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">
          {user?.role || 'USER'}
        </span>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Display name</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {user?.name || user?.username || 'Not available'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Email / Login</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {user?.email || user?.username || 'Not available'}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#home"
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
        >
          Back to Home
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    </section>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { getJson } from '../../services/api.js'

const quickActions = [
  {
    title: 'Manage resources',
    desc: 'Create, edit, and maintain lecture halls, labs, and equipment.',
    href: '#resources',
    icon: '🏫'
  },
  {
    title: 'Review bookings',
    desc: 'Approve or reject booking requests with a cleaner workflow.',
    href: '#bookings',
    icon: '📅'
  },
  {
    title: 'Handle tickets',
    desc: 'Track issues, assign work, and monitor maintenance progress.',
    href: '#tickets',
    icon: '🛠️'
  },
  {
    title: 'View users',
    desc: 'Monitor accounts, permissions, and access status.',
    href: '#users',
    icon: '👥'
  },
  {
    title: 'Send notification',
    desc: 'Send a notification to all users.',
    href: '#admin/notification',
    icon: '🔔'
  }
]

export default function AdminDashboardPage() {
  const { isAuthenticated, user } = useAuth()
  const role = user?.role
  const displayName = user?.name || user?.email || 'Administrator'

  const [statsState, setStatsState] = useState({
    resourcesActive: null,
    bookingsPending: null,
    ticketsOpen: null,
    usersActive: null,
  })
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')

  const [analyticsState, setAnalyticsState] = useState({
    topResources: [],
    peakHours: [],
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState('')

  const statCards = useMemo(() => {
    const format = (value, { pad2 } = {}) => {
      if (value == null) return '—'
      const s = String(value)
      return pad2 ? s.padStart(2, '0') : s
    }

    return [
      {
        label: 'Resources',
        value: format(statsState.resourcesActive),
        note: 'Active items',
        href: '#resources',
        accent: 'from-indigo-500 to-cyan-500',
      },
      {
        label: 'Bookings',
        value: format(statsState.bookingsPending, { pad2: true }),
        note: 'Pending approvals',
        href: '#bookings',
        accent: 'from-fuchsia-500 to-indigo-500',
      },
      {
        label: 'Tickets',
        value: format(statsState.ticketsOpen),
        note: 'Open issues',
        href: '#tickets',
        accent: 'from-cyan-500 to-emerald-500',
      },
      {
        label: 'Users',
        value: format(statsState.usersActive),
        note: 'Active accounts',
        href: '#users',
        accent: 'from-amber-500 to-orange-500',
      },
    ]
  }, [statsState])

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = '#login?mode=signin'
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || role !== 'ADMIN') return

    let cancelled = false

    async function loadStatsFromDb() {
      setStatsLoading(true)
      setStatsError('')

      try {
        const [resourcesActive, bookings, tickets, users] = await Promise.all([
          getJson('/api/resources?status=ACTIVE'),
          getJson('/api/bookings'),
          getJson('/api/tickets'),
          getJson('/api/users'),
        ])

        if (cancelled) return

        const bookingsPendingCount = (Array.isArray(bookings) ? bookings : []).filter(
          (b) => b?.status === 'PENDING',
        ).length

        const ticketsOpenCount = (Array.isArray(tickets) ? tickets : []).filter(
          (t) => t?.status === 'OPEN' || t?.status === 'IN_PROGRESS',
        ).length

        setStatsState({
          resourcesActive: Array.isArray(resourcesActive) ? resourcesActive.length : 0,
          bookingsPending: bookingsPendingCount,
          ticketsOpen: ticketsOpenCount,
          usersActive: Array.isArray(users) ? users.length : 0,
        })
      } catch (e) {
        if (cancelled) return
        setStatsError(e?.message || 'Failed to load dashboard stats')
      } finally {
        if (cancelled) return
        setStatsLoading(false)
      }
    }

    async function loadAnalyticsFromDb() {
      setAnalyticsLoading(true)
      setAnalyticsError('')

      try {
        const [topResources, peakHours] = await Promise.all([
          getJson('/api/analytics/top-resources?limit=5'),
          getJson('/api/analytics/peak-booking-hours'),
        ])

        if (cancelled) return

        setAnalyticsState({
          topResources: Array.isArray(topResources) ? topResources : [],
          peakHours: Array.isArray(peakHours) ? peakHours : [],
        })
      } catch (e) {
        if (cancelled) return
        setAnalyticsError(e?.message || 'Failed to load usage analytics')
      } finally {
        if (cancelled) return
        setAnalyticsLoading(false)
      }
    }

    loadStatsFromDb()
    loadAnalyticsFromDb()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, role])

  if (!isAuthenticated) {
    return null
  }

  if (role !== 'ADMIN') {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">
          Restricted
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900">
          Access denied
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
          This page is only available for admin accounts. Please return to the home page
          or sign in with an authorized account.
        </p>
        <a
          href="#home"
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
        >
          Go to Home
        </a>
      </section>
    )
  }

  return (
    <div className="w-full space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div>
            <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-indigo-600">
              Admin Control Center
            </p>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Dashboard
            </h2>

            <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
              Signed in as <span className="font-extrabold text-gray-900">{displayName}</span>.
              Manage campus resources, review bookings, monitor tickets, and keep
              operations running smoothly from one modern workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#bookings"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
              >
                Review bookings
              </a>
              <a
                href="#resources"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5"
              >
                Open resources
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {statCards.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${item.accent}`} />
                <div className="mt-4 text-sm font-bold text-slate-500">{item.label}</div>
                <div className="mt-1 text-3xl font-black tracking-tight text-slate-900">
                  {statsLoading ? '…' : item.value}
                </div>
                <div className="mt-2 text-sm text-slate-600">{item.note}</div>
                <div className="mt-4 text-sm font-bold text-indigo-600">Open →</div>
              </a>
            ))}

            {statsError ? (
              <div className="sm:col-span-2 rounded-[1.5rem] border border-rose-200 bg-rose-50/80 p-5 text-sm font-semibold text-rose-700">
                {statsError}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">
                Quick Actions
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
                Admin workflows
              </h3>
              <p className="mt-2 text-sm leading-7 text-gray-600 sm:text-base">
                Jump into the most common administrative actions with a cleaner layout.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {quickActions.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 text-2xl">
                  {item.icon}
                </div>

                <h4 className="mt-4 text-lg font-black tracking-tight text-gray-900">
                  {item.title}
                </h4>

                <p className="mt-2 text-sm leading-7 text-gray-600">
                  {item.desc}
                </p>

                <div className="mt-4 text-sm font-bold text-indigo-600">
                  Open section →
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">
              Access
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
              Admin notes
            </h3>

            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              This dashboard is role-gated. Non-admin users should not access these tools.
              If you are testing the interface, use the proper demo or admin account.
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                  Current role
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-slate-900 shadow-sm">
                  {role}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                Usage analytics are generated from booking and resource data in the database.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#login?mode=signin"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
                >
                  Open login
                </a>
                <a
                  href="#resources"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5"
                >
                  Browse resources
                </a>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">
              Activity
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
              System highlights
            </h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/90 p-4">
                <div className="text-sm font-bold text-slate-500">Pending approvals</div>
                <div className="mt-1 text-2xl font-black text-slate-900">
                  {statsLoading || statsState.bookingsPending == null
                    ? '…'
                    : String(statsState.bookingsPending).padStart(2, '0')}
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/90 p-4">
                <div className="text-sm font-bold text-slate-500">Open maintenance tickets</div>
                <div className="mt-1 text-2xl font-black text-slate-900">
                  {statsLoading || statsState.ticketsOpen == null ? '…' : statsState.ticketsOpen}
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/90 p-4">
                <div className="text-sm font-bold text-slate-500">Resources currently active</div>
                <div className="mt-1 text-2xl font-black text-slate-900">
                  {statsLoading || statsState.resourcesActive == null ? '…' : statsState.resourcesActive}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-indigo-600">
              Analytics
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-gray-900">
              Usage insights
            </h3>
            <p className="mt-2 text-sm leading-7 text-gray-600 sm:text-base">
              Top resources and peak booking request hours.
            </p>

            {analyticsError ? (
              <div className="mt-4 rounded-[1.25rem] border border-rose-200 bg-rose-50/80 p-4 text-sm font-semibold text-rose-700">
                {analyticsError}
              </div>
            ) : null}

            <div className="mt-5 grid gap-4">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/90 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-slate-500">Top resources</div>
                  <a href="#resources" className="text-sm font-bold text-indigo-600">View →</a>
                </div>

                {analyticsLoading ? (
                  <div className="mt-3 space-y-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 w-2/3 rounded bg-slate-200/70" />
                        <div className="h-2 w-full rounded bg-slate-200/70" />
                      </div>
                    ))}
                  </div>
                ) : analyticsState.topResources.length === 0 ? (
                  <div className="mt-3 text-sm text-slate-600">No bookings yet.</div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {(() => {
                      const max = analyticsState.topResources.reduce(
                        (m, r) => Math.max(m, Number(r?.bookingCount) || 0),
                        0,
                      ) || 1

                      return analyticsState.topResources.map((r) => {
                        const count = Number(r?.bookingCount) || 0
                        const pct = Math.max(6, Math.round((count / max) * 100))
                        const label = r?.resourceName || r?.resourceId || 'Unknown'

                        return (
                          <div key={r?.resourceId || label} className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate text-sm font-black text-slate-900">
                                {label}
                              </div>
                              <div className="text-sm font-bold text-slate-600">{count}</div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/90 p-4">
                <div className="text-sm font-bold text-slate-500">Peak booking hours</div>

                {analyticsLoading ? (
                  <div className="mt-3 h-24 rounded bg-slate-200/60" />
                ) : analyticsState.peakHours.length === 0 ? (
                  <div className="mt-3 text-sm text-slate-600">No bookings yet.</div>
                ) : (
                  <div className="mt-4">
                    {(() => {
                      const hours = analyticsState.peakHours
                      const max = hours.reduce((m, h) => Math.max(m, Number(h?.count) || 0), 0) || 1

                      return (
                        <div>
                          <div className="flex h-24 items-end gap-1">
                            {hours.map((h) => {
                              const hour = Number(h?.hour) || 0
                              const count = Number(h?.count) || 0
                              const heightPct = Math.max(4, Math.round((count / max) * 100))
                              const title = `${String(hour).padStart(2, '0')}:00 — ${count}`

                              return (
                                <div
                                  key={hour}
                                  title={title}
                                  className="flex-1 rounded bg-indigo-200"
                                  style={{ height: `${heightPct}%` }}
                                />
                              )
                            })}
                          </div>

                          <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-500">
                            <span>00</span>
                            <span>06</span>
                            <span>12</span>
                            <span>18</span>
                            <span>23</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
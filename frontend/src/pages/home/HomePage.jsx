import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import FeatureCard from '../../components/common/FeatureCard.jsx'
import { getJson } from '../../services/api.js'

export default function HomePage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getJson('/api/public/stats')
        if (!cancelled) setStats(data)
      } catch {
        if (!cancelled) setStats(null)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeBookings = useMemo(() => stats?.activeBookings ?? 0, [stats])
  const openTickets = useMemo(() => stats?.openTickets ?? 0, [stats])
  const resourceUsagePercent = useMemo(() => stats?.resourceUsagePercent ?? 0, [stats])
  const ticketResolutionPercent = useMemo(() => stats?.ticketResolutionPercent ?? 0, [stats])
  const userEngagementPercent = useMemo(() => stats?.userEngagementPercent ?? 0, [stats])

  return (
    <>
      <section
        id="home"
        className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 px-6 py-10 shadow-xl backdrop-blur sm:px-10 lg:px-12"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10" />
        <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              <CheckCircle2 className="h-4 w-4" />
              Smart Campus Operations Hub
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Modern campus management,
              <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                built for bookings and support
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              A modern PAF project UI for managing resources, bookings, maintenance tickets,
              notifications, and role-based workflows in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#resources"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition hover:bg-gray-800"
              >
                View resources
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">08</p>
                <p className="mt-1 text-sm text-gray-600">Core modules</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm">
                <p className="text-2xl font-bold text-gray-900">24/7</p>
                <p className="mt-1 text-sm text-gray-600">System access</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-gray-200 bg-white/70 p-4 shadow-sm sm:col-span-1">
                <p className="text-2xl font-bold text-gray-900">Role</p>
                <p className="mt-1 text-sm text-gray-600">Based security</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-gray-200 bg-gray-950 p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-gray-400">Dashboard Preview</p>
                  <h3 className="mt-1 text-xl font-semibold">Campus Control Center</h3>
                </div>
                <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                  Live UI
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-gray-400">Active Bookings</p>
                  <p className="mt-2 text-3xl font-bold">{activeBookings.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-gray-400">Open Tickets</p>
                  <p className="mt-2 text-3xl font-bold">{openTickets.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 sm:col-span-2">
                  <p className="text-sm text-gray-400">System Overview</p>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-gray-400">
                        <span>Resource usage</span>
                        <span>{resourceUsagePercent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-indigo-400"
                          style={{ width: `${resourceUsagePercent}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-gray-400">
                        <span>Ticket resolution</span>
                        <span>{ticketResolutionPercent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-violet-400"
                          style={{ width: `${ticketResolutionPercent}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-gray-400">
                        <span>User engagement</span>
                        <span>{userEngagementPercent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-cyan-400"
                          style={{ width: `${userEngagementPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mt-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Core platform capabilities
            </h2>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            Frontend is running
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard
            icon={<CalendarCheck className="h-6 w-6" />}
            title="Resource Booking"
            description="Reserve lecture halls, labs, meeting rooms, and equipment with conflict-aware scheduling."
          />
          <FeatureCard
            icon={<Wrench className="h-6 w-6" />}
            title="Service Tickets"
            description="Create, assign, and resolve maintenance or incident issues with status tracking."
          />
          <FeatureCard
            icon={<Bell className="h-6 w-6" />}
            title="Notifications"
            description="Keep users informed about approvals, rejections, updates, and new activity."
          />
          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Secure Access"
            description="Protect workflows with authentication, authorization, and role-based route control."
          />
        </div>
      </section>
    </>
  )
}

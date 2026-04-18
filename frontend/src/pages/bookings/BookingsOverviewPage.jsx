import { useEffect, useState } from 'react'
import { ClipboardList, Clock3, UserCheck } from 'lucide-react'
import { getJson, postJson } from '../../services/api.js'

export default function BookingsOverviewPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getJson('/api/bookings')
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (busy) return

    const formData = new FormData(e.currentTarget)
    const resourceId = String(formData.get('resourceId') || '').trim()
    const requestedBy = String(formData.get('requestedBy') || '').trim()
    if (!resourceId || !requestedBy) return

    setBusy(true)
    setError('')
    try {
      await postJson('/api/bookings', { resourceId, requestedBy })
      e.currentTarget.reset()
      await load()
    } catch (e2) {
      setError(e2?.message || 'Failed to create booking')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="bookings" className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
            Bookings
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Recent booking activity
          </h2>
        </div>
        <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
          Stored in MongoDB
        </div>
      </div>

      <form onSubmit={handleCreate} className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Resource ID</label>
            <input
              name="resourceId"
              required
              placeholder="Paste a resource id"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Requested by</label>
            <input
              name="requestedBy"
              required
              placeholder="e.g., user"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Create Booking'}
            </button>
          </div>
        </div>
        {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}
      </form>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Loading bookings…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            No bookings found. Create one above.
          </div>
        ) : (
          items.map((b) => (
            <div key={b.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  {b.status === 'APPROVED' ? (
                    <UserCheck className="h-5 w-5" />
                  ) : b.status === 'CANCELLED' || b.status === 'REJECTED' ? (
                    <ClipboardList className="h-5 w-5" />
                  ) : (
                    <Clock3 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Booking</h3>
                  <p className="text-sm text-gray-600">Requested by {b.requestedBy}</p>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm text-gray-600">
                <p>Resource ID: {b.resourceId}</p>
              </div>
              <div className="mt-5 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {b.status}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

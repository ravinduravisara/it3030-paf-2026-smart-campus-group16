import { useEffect, useState } from 'react'
import { CheckCircle2, ClipboardList, Wrench } from 'lucide-react'
import QuickCard from '../../components/common/QuickCard.jsx'
import { getJson, postJson } from '../../services/api.js'

export default function TicketsOverviewPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getJson('/api/tickets')
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load tickets')
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
    const title = String(formData.get('title') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const createdBy = String(formData.get('createdBy') || '').trim()
    const priority = String(formData.get('priority') || '').trim()
    if (!title || !createdBy) return

    setBusy(true)
    setError('')
    try {
      await postJson('/api/tickets', {
        title,
        description,
        createdBy,
        priority: priority || undefined,
      })
      e.currentTarget.reset()
      await load()
    } catch (e2) {
      setError(e2?.message || 'Failed to create ticket')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="tickets" className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Tickets
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Maintenance and incident tracking
          </h2>
        </div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          Stored in MongoDB
        </div>
      </div>

      <form onSubmit={handleCreate} className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              name="title"
              required
              placeholder="e.g., Projector not turning on"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <select
              name="priority"
              defaultValue="MEDIUM"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Created by</label>
            <input
              name="createdBy"
              required
              placeholder="e.g., user"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div className="md:col-span-4">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <input
              name="description"
              placeholder="Optional"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
        </div>
        {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Create Ticket'}
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Loading tickets…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            No tickets found. Create one above.
          </div>
        ) : (
          items.map((t) => (
            <QuickCard
              key={t.id}
              icon={
                t.status === 'RESOLVED' || t.status === 'CLOSED' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : t.status === 'IN_PROGRESS' ? (
                  <ClipboardList className="h-5 w-5" />
                ) : (
                  <Wrench className="h-5 w-5" />
                )
              }
              title={t.title}
              subtitle={[t.priority, `by ${t.createdBy}`].filter(Boolean).join(' • ')}
              badge={t.status || 'OPEN'}
            />
          ))
        )}
      </div>
    </section>
  )
}

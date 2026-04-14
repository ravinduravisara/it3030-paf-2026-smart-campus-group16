import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, Laptop, MapPin } from 'lucide-react'
import QuickCard from '../../components/common/QuickCard.jsx'
import { getJson, postJson } from '../../services/api.js'

export default function ResourcesOverviewPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const iconByType = useMemo(
    () => ({
      LAB: <Laptop className="h-5 w-5" />,
      ROOM: <MapPin className="h-5 w-5" />,
      EQUIPMENT: <CalendarCheck className="h-5 w-5" />,
      VEHICLE: <MapPin className="h-5 w-5" />,
      OTHER: <MapPin className="h-5 w-5" />,
    }),
    [],
  )

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getJson('/api/resources')
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load resources')
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
    const name = String(formData.get('name') || '').trim()
    const type = String(formData.get('type') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const location = String(formData.get('location') || '').trim()
    if (!name || !type) return

    setBusy(true)
    setError('')
    try {
      await postJson('/api/resources', { name, type, description, location })
      e.currentTarget.reset()
      await load()
    } catch (e2) {
      setError(e2?.message || 'Failed to create resource')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="resources" className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Resources
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Campus facilities and assets
          </h2>
        </div>
      </div>

      <form onSubmit={handleCreate} className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Resource name</label>
            <input
              name="name"
              required
              placeholder="e.g., Computer Lab A"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              required
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
              defaultValue="LAB"
            >
              <option value="ROOM">ROOM</option>
              <option value="LAB">LAB</option>
              <option value="EQUIPMENT">EQUIPMENT</option>
              <option value="VEHICLE">VEHICLE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              name="location"
              placeholder="e.g., Block B"
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
          {busy ? 'Saving…' : 'Add Resource'}
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Loading resources…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
            No resources found. Add one above.
          </div>
        ) : (
          items.map((r) => (
            <QuickCard
              key={r.id}
              icon={iconByType[r.type] || <MapPin className="h-5 w-5" />}
              title={r.name}
              subtitle={[r.location, r.description].filter(Boolean).join(' • ') || r.type}
              badge={r.status || 'AVAILABLE'}
            />
          ))
        )}
      </div>
    </section>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarCheck, Laptop, MapPin } from 'lucide-react'
import QuickCard from '../../components/common/QuickCard.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { deleteJson, getJson, postJson, putJson } from '../../services/api.js'

function toIsoFromLocalDateTime(value) {
  const raw = String(value || '').trim()
  if (!raw) return null
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function formatMaybeDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

export default function ResourcesOverviewPage() {
  const { isAuthenticated, user } = useAuth()
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const loadSeq = useRef(0)
  const autoSearchInitialized = useRef(false)

  const [filters, setFilters] = useState(() => ({
    q: '',
    type: 'ALL',
    minCapacity: '',
    location: '',
    status: isAdmin ? 'ALL' : 'ACTIVE',
  }))

  const [selected, setSelected] = useState(null)

  const [createWindows, setCreateWindows] = useState([])
  const [createWindowStart, setCreateWindowStart] = useState('')
  const [createWindowEnd, setCreateWindowEnd] = useState('')

  const [editing, setEditing] = useState(null)
  const [editDraft, setEditDraft] = useState(null)
  const [editWindows, setEditWindows] = useState([])
  const [editWindowStart, setEditWindowStart] = useState('')
  const [editWindowEnd, setEditWindowEnd] = useState('')

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

  useEffect(() => {
    // Default views:
    // - Users: ACTIVE
    // - Admins: ALL (manage full catalogue)
    setFilters((prev) => {
      if (isAdmin) {
        return prev.status === 'ACTIVE' ? { ...prev, status: 'ALL' } : prev
      }
      if (prev.status && prev.status !== 'ALL') return prev
      return { ...prev, status: 'ACTIVE' }
    })
  }, [isAdmin])

  function buildQueryString(nextFilters) {
    const params = new URLSearchParams()

    const q = String(nextFilters.q || '').trim()
    const type = String(nextFilters.type || '').trim()
    const location = String(nextFilters.location || '').trim()
    const status = String(nextFilters.status || '').trim()
    const minCapacityRaw = String(nextFilters.minCapacity || '').trim()

    if (q) params.set('q', q)
    if (location) params.set('location', location)
    if (type && type !== 'ALL') params.set('type', type)
    if (status && status !== 'ALL') params.set('status', status)

    const minCapacity = Number(minCapacityRaw)
    if (Number.isFinite(minCapacity) && minCapacity > 0) {
      params.set('minCapacity', String(minCapacity))
    }

    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }

  async function load(nextFilters = filters) {
    const seq = ++loadSeq.current

    setLoading(true)
    setError('')
    try {
      const data = await getJson(`/api/resources${buildQueryString(nextFilters)}`)
      if (seq !== loadSeq.current) return
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      if (seq !== loadSeq.current) return
      setError(e?.message || 'Failed to load resources')
    } finally {
      if (seq !== loadSeq.current) return
      setLoading(false)
    }
  }

  useEffect(() => {
    load(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Live search: as the user types/changes filters, refresh list with a small debounce.
    if (!autoSearchInitialized.current) {
      autoSearchInitialized.current = true
      return
    }

    if (busy) return

    const handle = setTimeout(() => {
      load(filters)
    }, 300)

    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, busy])

  async function handleApplyFilters(e) {
    e.preventDefault()
    if (busy) return
    await load(filters)
  }

  function addCreateWindow() {
    const start = toIsoFromLocalDateTime(createWindowStart)
    const end = toIsoFromLocalDateTime(createWindowEnd)
    if (!start || !end) return
    if (new Date(start) >= new Date(end)) return

    setCreateWindows((prev) => [...prev, { start, end }])
    setCreateWindowStart('')
    setCreateWindowEnd('')
  }

  function removeCreateWindow(idx) {
    setCreateWindows((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!isAdmin || busy) return

    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const type = String(formData.get('type') || '').trim()
    const capacityRaw = String(formData.get('capacity') || '').trim()
    const status = String(formData.get('status') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const location = String(formData.get('location') || '').trim()

    const capacity = Number(capacityRaw)
    if (!name || !type || !Number.isFinite(capacity) || capacity <= 0) return

    setBusy(true)
    setError('')
    try {
      await postJson('/api/resources', {
        name,
        type,
        capacity,
        status: status || undefined,
        description: description || undefined,
        location: location || undefined,
        availabilityWindows: createWindows.length ? createWindows : undefined,
      })
      e.currentTarget.reset()
      setCreateWindows([])
      setCreateWindowStart('')
      setCreateWindowEnd('')
      await load(filters)
    } catch (e2) {
      setError(e2?.message || 'Failed to create resource')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(resource) {
    setEditing(resource)
    setEditDraft({
      name: resource?.name || '',
      type: resource?.type || 'LAB',
      capacity: resource?.capacity ?? '',
      status: resource?.status || 'ACTIVE',
      description: resource?.description || '',
      location: resource?.location || '',
    })
    setEditWindows(Array.isArray(resource?.availabilityWindows) ? resource.availabilityWindows : [])
    setEditWindowStart('')
    setEditWindowEnd('')
  }

  function cancelEdit() {
    setEditing(null)
    setEditDraft(null)
    setEditWindows([])
  }

  function addEditWindow() {
    const start = toIsoFromLocalDateTime(editWindowStart)
    const end = toIsoFromLocalDateTime(editWindowEnd)
    if (!start || !end) return
    if (new Date(start) >= new Date(end)) return

    setEditWindows((prev) => [...prev, { start, end }])
    setEditWindowStart('')
    setEditWindowEnd('')
  }

  function removeEditWindow(idx) {
    setEditWindows((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (!isAdmin || busy || !editing || !editDraft) return

    const capacity = Number(editDraft.capacity)
    if (!editDraft.name.trim() || !editDraft.type || !Number.isFinite(capacity) || capacity <= 0) return

    setBusy(true)
    setError('')
    try {
      await putJson(`/api/resources/${editing.id}`, {
        name: editDraft.name.trim(),
        type: editDraft.type,
        capacity,
        status: editDraft.status || undefined,
        description: editDraft.description.trim() || undefined,
        location: editDraft.location.trim() || undefined,
        availabilityWindows: editWindows,
      })

      cancelEdit()
      await load(filters)
    } catch (e2) {
      setError(e2?.message || 'Failed to update resource')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(resource) {
    if (!isAdmin || busy || !resource?.id) return
    const ok = window.confirm(`Delete resource "${resource.name}"?`)
    if (!ok) return

    setBusy(true)
    setError('')
    try {
      await deleteJson(`/api/resources/${resource.id}`)
      if (editing?.id === resource.id) {
        cancelEdit()
      }
      await load(filters)
    } catch (e) {
      setError(e?.message || 'Failed to delete resource')
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
            Facilities & assets catalogue
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Browse resources, check metadata, and filter by type, capacity, location, and status.
          </p>
        </div>
        <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
          {isAdmin ? 'Admin: Manage catalogue' : 'User: Browse catalogue'}
        </div>
      </div>

      <form onSubmit={handleApplyFilters} className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <input
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Name, location, description"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            >
              <option value="ALL">ALL</option>
              <option value="ROOM">ROOM</option>
              <option value="LAB">LAB</option>
              <option value="EQUIPMENT">EQUIPMENT</option>
              <option value="VEHICLE">VEHICLE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Min capacity</label>
            <input
              value={filters.minCapacity}
              onChange={(e) => setFilters((prev) => ({ ...prev, minCapacity: e.target.value }))}
              inputMode="numeric"
              placeholder="e.g., 30"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            >
              <option value="ALL">ALL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </div>
          <div className="md:col-span-5">
            <label className="text-sm font-medium text-gray-700">Location</label>
            <input
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Block B"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Working…' : 'Apply filters'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const next = {
                q: '',
                type: 'ALL',
                minCapacity: '',
                location: '',
                status: isAdmin ? 'ALL' : 'ACTIVE',
              }
              setFilters(next)
              load(next)
            }}
            className="rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>

      {isAdmin ? (
        <form onSubmit={handleCreate} className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">Add a new resource</div>
              <div className="mt-1 text-xs text-gray-600">Admins can add and manage the full catalogue.</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Resource name</label>
              <input
                name="name"
                required
                placeholder="e.g., Lecture Hall A"
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
              <label className="text-sm font-medium text-gray-700">Capacity</label>
              <input
                name="capacity"
                required
                inputMode="numeric"
                placeholder="e.g., 40"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
                defaultValue="ACTIVE"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </div>
            <div className="md:col-span-2">
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

          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">Availability windows (optional)</div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Start</label>
                <input
                  type="datetime-local"
                  value={createWindowStart}
                  onChange={(e) => setCreateWindowStart(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500/20 focus:ring-4"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">End</label>
                <input
                  type="datetime-local"
                  value={createWindowEnd}
                  onChange={(e) => setCreateWindowEnd(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500/20 focus:ring-4"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addCreateWindow}
                  className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Add window
                </button>
              </div>
            </div>

            {createWindows.length ? (
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {createWindows.map((w, idx) => (
                  <li key={`${w.start}-${w.end}-${idx}`} className="flex items-center justify-between gap-3">
                    <span>
                      {formatMaybeDate(w.start)} → {formatMaybeDate(w.end)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCreateWindow(idx)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-gray-600">No windows added.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Add Resource'}
          </button>
        </form>
      ) : null}

      {isAdmin && editing && editDraft ? (
        <form onSubmit={handleUpdate} className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">Edit resource</div>
              <div className="mt-1 text-xs text-gray-600">ID: {editing.id}</div>
            </div>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                value={editDraft.name}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={editDraft.type}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, type: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
              >
                <option value="ROOM">ROOM</option>
                <option value="LAB">LAB</option>
                <option value="EQUIPMENT">EQUIPMENT</option>
                <option value="VEHICLE">VEHICLE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Capacity</label>
              <input
                value={editDraft.capacity}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, capacity: e.target.value }))}
                required
                inputMode="numeric"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={editDraft.status}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input
                value={editDraft.location}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, location: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
              />
            </div>
            <div className="md:col-span-4">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input
                value={editDraft.description}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-sm font-semibold text-gray-900">Availability windows</div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Start</label>
                <input
                  type="datetime-local"
                  value={editWindowStart}
                  onChange={(e) => setEditWindowStart(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500/20 focus:ring-4"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">End</label>
                <input
                  type="datetime-local"
                  value={editWindowEnd}
                  onChange={(e) => setEditWindowEnd(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-500/20 focus:ring-4"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addEditWindow}
                  className="w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Add window
                </button>
              </div>
            </div>

            {editWindows.length ? (
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {editWindows.map((w, idx) => (
                  <li key={`${w.start}-${w.end}-${idx}`} className="flex items-center justify-between gap-3">
                    <span>
                      {formatMaybeDate(w.start)} → {formatMaybeDate(w.end)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEditWindow(idx)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-gray-600">No windows set.</p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={busy}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleDelete(editing)}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-3 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        </form>
      ) : null}

      {isAdmin ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="text-sm font-semibold text-gray-900">Resource management</div>
            <div className="mt-1 text-xs text-gray-600">Edit, delete, change status, and manage availability windows.</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Capacity</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Windows</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td className="px-6 py-4 text-gray-600" colSpan={7}>Loading…</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-gray-600" colSpan={7}>No resources found.</td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setSelected(r)}
                          className="font-semibold text-indigo-700 hover:text-indigo-900"
                        >
                          {r.name}
                        </button>
                        <div className="mt-1 text-xs text-gray-500">{r.id}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{r.type}</td>
                      <td className="px-6 py-4 text-gray-700">{r.capacity ?? '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{r.location || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{r.status || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{Array.isArray(r.availabilityWindows) ? r.availabilityWindows.length : 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
              Loading resources…
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
              No resources found.
            </div>
          ) : (
            items.map((r) => (
              <button key={r.id} type="button" className="text-left" onClick={() => setSelected(r)}>
                <QuickCard
                  icon={iconByType[r.type] || <MapPin className="h-5 w-5" />}
                  title={r.name}
                  subtitle={[
                    r.type,
                    typeof r.capacity === 'number' ? `Capacity ${r.capacity}` : null,
                    r.location,
                    r.description,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                  badge={r.status || 'ACTIVE'}
                />
              </button>
            ))
          )}
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  Resource details
                </div>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">{selected.name}</h3>
                <p className="mt-1 text-sm text-gray-600">ID: {selected.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold text-gray-600">Type</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{selected.type}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold text-gray-600">Capacity</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{selected.capacity ?? '-'}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold text-gray-600">Location</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{selected.location || '-'}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold text-gray-600">Status</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{selected.status || '-'}</div>
              </div>
            </div>

            {selected.description ? (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="text-xs font-semibold text-gray-600">Description</div>
                <div className="mt-1 text-sm text-gray-800">{selected.description}</div>
              </div>
            ) : null}

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="text-xs font-semibold text-gray-600">Availability windows</div>
              {Array.isArray(selected.availabilityWindows) && selected.availabilityWindows.length ? (
                <ul className="mt-2 space-y-2 text-sm text-gray-800">
                  {selected.availabilityWindows.map((w, idx) => (
                    <li key={`${w.start}-${w.end}-${idx}`}>
                      {formatMaybeDate(w.start)} → {formatMaybeDate(w.end)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2 text-sm text-gray-600">No windows set.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

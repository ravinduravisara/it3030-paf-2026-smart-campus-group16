import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { CalendarCheck, Laptop, MapPin, Search } from 'lucide-react'
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

  const [createErrors, setCreateErrors] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [windowError, setWindowError] = useState('')
  const [editWindowError, setEditWindowError] = useState('')

  const [allResources, setAllResources] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Load all resources once for suggestions
  useEffect(() => {
    getJson('/api/resources').then(data => {
      if (Array.isArray(data)) setAllResources(data)
    }).catch(() => {})
  }, [])

  const computeSuggestions = useCallback((query) => {
    const q = query.trim().toLowerCase()
    if (!q) { setSuggestions([]); return }
    const seen = new Set()
    const results = []
    for (const r of allResources) {
      const fields = [r.name, r.location, r.description].filter(Boolean)
      for (const f of fields) {
        if (f.toLowerCase().includes(q) && !seen.has(f)) {
          seen.add(f)
          results.push(f)
          if (results.length >= 8) break
        }
      }
      if (results.length >= 8) break
    }
    setSuggestions(results)
  }, [allResources])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    if (!start || !end) { setWindowError('Both start and end are required.'); return }
    if (new Date(start) >= new Date(end)) { setWindowError('Start must be before end.'); return }
    if (createWindows.length >= 20) { setWindowError('Maximum 20 availability windows allowed.'); return }
    // check overlap
    for (let i = 0; i < createWindows.length; i++) {
      const w = createWindows[i]
      if (new Date(start) < new Date(w.end) && new Date(w.start) < new Date(end)) {
        setWindowError(`Overlaps with window ${i + 1}.`); return
      }
    }
    setWindowError('')
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

    const errs = {}
    if (!name) errs.name = 'Name is required.'
    else if (name.length < 2) errs.name = 'Name must be at least 2 characters.'
    else if (name.length > 200) errs.name = 'Name must not exceed 200 characters.'
    if (!type) errs.type = 'Type is required.'
    const capacity = Number(capacityRaw)
    if (!capacityRaw) errs.capacity = 'Capacity is required.'
    else if (!Number.isFinite(capacity) || capacity <= 0) errs.capacity = 'Capacity must be a positive number.'
    else if (capacity > 100000) errs.capacity = 'Capacity must not exceed 100,000.'
    else if (!Number.isInteger(capacity)) errs.capacity = 'Capacity must be a whole number.'
    if (description.length > 1000) errs.description = 'Description must not exceed 1000 characters.'
    if (location.length > 300) errs.location = 'Location must not exceed 300 characters.'

    setCreateErrors(errs)
    if (Object.keys(errs).length > 0) return

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
      setCreateErrors({})
      await load(filters)
    } catch (e2) {
      const msg = extractApiError(e2)
      setError(msg)
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
    if (!start || !end) { setEditWindowError('Both start and end are required.'); return }
    if (new Date(start) >= new Date(end)) { setEditWindowError('Start must be before end.'); return }
    if (editWindows.length >= 20) { setEditWindowError('Maximum 20 availability windows allowed.'); return }
    for (let i = 0; i < editWindows.length; i++) {
      const w = editWindows[i]
      if (new Date(start) < new Date(w.end) && new Date(w.start) < new Date(end)) {
        setEditWindowError(`Overlaps with window ${i + 1}.`); return
      }
    }
    setEditWindowError('')
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

    const errs = {}
    const name = editDraft.name.trim()
    if (!name) errs.name = 'Name is required.'
    else if (name.length < 2) errs.name = 'Name must be at least 2 characters.'
    else if (name.length > 200) errs.name = 'Name must not exceed 200 characters.'
    if (!editDraft.type) errs.type = 'Type is required.'
    const capacity = Number(editDraft.capacity)
    if (editDraft.capacity === '' || editDraft.capacity == null) errs.capacity = 'Capacity is required.'
    else if (!Number.isFinite(capacity) || capacity <= 0) errs.capacity = 'Capacity must be a positive number.'
    else if (capacity > 100000) errs.capacity = 'Capacity must not exceed 100,000.'
    else if (!Number.isInteger(capacity)) errs.capacity = 'Capacity must be a whole number.'
    const desc = editDraft.description.trim()
    if (desc.length > 1000) errs.description = 'Description must not exceed 1000 characters.'
    const loc = editDraft.location.trim()
    if (loc.length > 300) errs.location = 'Location must not exceed 300 characters.'

    setEditErrors(errs)
    if (Object.keys(errs).length > 0) return

    setBusy(true)
    setError('')
    try {
      await putJson(`/api/resources/${editing.id}`, {
        name: name,
        type: editDraft.type,
        capacity,
        status: editDraft.status || undefined,
        description: desc || undefined,
        location: loc || undefined,
        availabilityWindows: editWindows,
      })

      cancelEdit()
      setEditErrors({})
      await load(filters)
    } catch (e2) {
      setError(extractApiError(e2))
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
      setError(extractApiError(e))
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
          <div className="md:col-span-2" ref={searchRef}>
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={filters.q}
                onChange={(e) => {
                  const v = e.target.value
                  setFilters((prev) => ({ ...prev, q: v }))
                  computeSuggestions(v)
                  setShowSuggestions(true)
                  setActiveSuggestion(-1)
                }}
                onFocus={() => { if (filters.q.trim()) { computeSuggestions(filters.q); setShowSuggestions(true) } }}
                onKeyDown={(e) => {
                  if (!showSuggestions || suggestions.length === 0) return
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setActiveSuggestion((prev) => (prev + 1) % suggestions.length)
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setActiveSuggestion((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
                  } else if (e.key === 'Enter' && activeSuggestion >= 0) {
                    e.preventDefault()
                    const picked = suggestions[activeSuggestion]
                    setFilters((prev) => ({ ...prev, q: picked }))
                    setShowSuggestions(false)
                    setActiveSuggestion(-1)
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false)
                  }
                }}
                placeholder="Name, location, description"
                autoComplete="off"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-indigo-500/20 focus:ring-4"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul
                  ref={suggestionsRef}
                  className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
                >
                  {suggestions.map((s, i) => {
                    const q = filters.q.trim().toLowerCase()
                    const idx = s.toLowerCase().indexOf(q)
                    return (
                      <li
                        key={s}
                        onMouseDown={() => {
                          setFilters((prev) => ({ ...prev, q: s }))
                          setShowSuggestions(false)
                          setActiveSuggestion(-1)
                        }}
                        onMouseEnter={() => setActiveSuggestion(i)}
                        className={`cursor-pointer px-4 py-2 text-sm ${i === activeSuggestion ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {idx >= 0 ? (
                          <>
                            {s.slice(0, idx)}
                            <span className="font-semibold text-indigo-600">{s.slice(idx, idx + q.length)}</span>
                            {s.slice(idx + q.length)}
                          </>
                        ) : s}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
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
                maxLength={200}
                placeholder="e.g., Lecture Hall A"
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${createErrors.name ? 'border-rose-300' : 'border-gray-200'}`}
              />
              {createErrors.name && <p className="mt-1 text-xs text-rose-600">{createErrors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                name="type"
                required
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${createErrors.type ? 'border-rose-300' : 'border-gray-200'}`}
                defaultValue="LAB"
              >
                <option value="ROOM">ROOM</option>
                <option value="LAB">LAB</option>
                <option value="EQUIPMENT">EQUIPMENT</option>
                <option value="VEHICLE">VEHICLE</option>
                <option value="OTHER">OTHER</option>
              </select>
              {createErrors.type && <p className="mt-1 text-xs text-rose-600">{createErrors.type}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Capacity</label>
              <input
                name="capacity"
                required
                inputMode="numeric"
                placeholder="e.g., 40"
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${createErrors.capacity ? 'border-rose-300' : 'border-gray-200'}`}
              />
              {createErrors.capacity && <p className="mt-1 text-xs text-rose-600">{createErrors.capacity}</p>}
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
                maxLength={300}
                placeholder="e.g., Block B"
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${createErrors.location ? 'border-rose-300' : 'border-gray-200'}`}
              />
              {createErrors.location && <p className="mt-1 text-xs text-rose-600">{createErrors.location}</p>}
            </div>
            <div className="md:col-span-4">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input
                name="description"
                maxLength={1000}
                placeholder="Optional"
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${createErrors.description ? 'border-rose-300' : 'border-gray-200'}`}
              />
              {createErrors.description && <p className="mt-1 text-xs text-rose-600">{createErrors.description}</p>}
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

            {windowError && <p className="mt-2 text-xs text-rose-600">{windowError}</p>}

            {createWindows.length ? (
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {createWindows.map((w, idx) => (
                  <li key={`${w.start}-${w.end}-${idx}`} className="flex items-center justify-between gap-3">
                    <span>
                      {formatMaybeDate(w.start)} → {formatMaybeDate(w.end)}
                    </span>
                    <button
                      type="button"
                      onClick={() => { removeCreateWindow(idx); setWindowError('') }}
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
                onChange={(e) => { setEditDraft((prev) => ({ ...prev, name: e.target.value })); setEditErrors((p) => ({ ...p, name: undefined })) }}
                required
                maxLength={200}
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${editErrors.name ? 'border-rose-300' : 'border-gray-200'}`}
              />
              {editErrors.name ? <p className="mt-1 text-xs text-rose-600">{editErrors.name}</p> : <p className="mt-1 text-xs text-gray-400">{editDraft.name.length}/200</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={editDraft.type}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, type: e.target.value }))}
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${editErrors.type ? 'border-rose-300' : 'border-gray-200'}`}
              >
                <option value="ROOM">ROOM</option>
                <option value="LAB">LAB</option>
                <option value="EQUIPMENT">EQUIPMENT</option>
                <option value="VEHICLE">VEHICLE</option>
                <option value="OTHER">OTHER</option>
              </select>
              {editErrors.type && <p className="mt-1 text-xs text-rose-600">{editErrors.type}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Capacity</label>
              <input
                value={editDraft.capacity}
                onChange={(e) => { setEditDraft((prev) => ({ ...prev, capacity: e.target.value })); setEditErrors((p) => ({ ...p, capacity: undefined })) }}
                required
                inputMode="numeric"
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${editErrors.capacity ? 'border-rose-300' : 'border-gray-200'}`}
              />
              {editErrors.capacity && <p className="mt-1 text-xs text-rose-600">{editErrors.capacity}</p>}
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
                onChange={(e) => { setEditDraft((prev) => ({ ...prev, location: e.target.value })); setEditErrors((p) => ({ ...p, location: undefined })) }}
                maxLength={300}
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${editErrors.location ? 'border-rose-300' : 'border-gray-200'}`}
              />
              {editErrors.location ? <p className="mt-1 text-xs text-rose-600">{editErrors.location}</p> : <p className="mt-1 text-xs text-gray-400">{editDraft.location.length}/300</p>}
            </div>
            <div className="md:col-span-4">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input
                value={editDraft.description}
                onChange={(e) => { setEditDraft((prev) => ({ ...prev, description: e.target.value })); setEditErrors((p) => ({ ...p, description: undefined })) }}
                maxLength={1000}
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4 ${editErrors.description ? 'border-rose-300' : 'border-gray-200'}`}
              />
              {editErrors.description ? <p className="mt-1 text-xs text-rose-600">{editErrors.description}</p> : <p className="mt-1 text-xs text-gray-400">{editDraft.description.length}/1000</p>}
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

            {editWindowError && <p className="mt-2 text-xs text-rose-600">{editWindowError}</p>}

            {editWindows.length ? (
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {editWindows.map((w, idx) => (
                  <li key={`${w.start}-${w.end}-${idx}`} className="flex items-center justify-between gap-3">
                    <span>
                      {formatMaybeDate(w.start)} → {formatMaybeDate(w.end)}
                    </span>
                    <button
                      type="button"
                      onClick={() => { removeEditWindow(idx); setEditWindowError('') }}
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

function extractApiError(err) {
  try {
    const data = JSON.parse(err?.message || '{}')
    return data.error || data.message || err?.message || 'Something went wrong'
  } catch {
    return err?.message || 'Something went wrong'
  }
}

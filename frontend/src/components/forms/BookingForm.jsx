import { useEffect, useState } from 'react'
import { getJson } from '../../services/api.js'

export default function BookingForm({ onSubmit, loading }) {
  const [resources, setResources] = useState([])
  const [form, setForm] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    getJson('/api/resources')
      .then(data => setResources(Array.isArray(data) ? data : []))
      .catch(() => setResources([]))
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.resourceId || !form.date || !form.startTime || !form.endTime || !form.purpose) {
      setError('Please fill in all required fields.')
      return
    }

    if (form.endTime <= form.startTime) {
      setError('End time must be after start time.')
      return
    }

    onSubmit({
      ...form,
      expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees, 10) : null,
    })
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Resource *</label>
        <select name="resourceId" value={form.resourceId} onChange={handleChange} className={inputClass}>
          <option value="">Select a resource</option>
          {resources.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.type})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Start Time *</label>
          <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">End Time *</label>
          <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Purpose *</label>
        <textarea
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          rows={3}
          className={inputClass}
          placeholder="Describe the purpose of this booking"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Expected Attendees</label>
        <input
          type="number"
          name="expectedAttendees"
          value={form.expectedAttendees}
          onChange={handleChange}
          min={1}
          className={inputClass}
          placeholder="Optional"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create Booking'}
      </button>
    </form>
  )
}

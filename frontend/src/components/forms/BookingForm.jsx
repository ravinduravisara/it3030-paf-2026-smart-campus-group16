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
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    getJson('/api/resources')
      .then(data => setResources(Array.isArray(data) ? data : []))
      .catch(() => setResources([]))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}

    if (!form.resourceId) errs.resourceId = 'Please select a resource.'
    if (!form.date) {
      errs.date = 'Date is required.'
    } else {
      const today = new Date().toISOString().split('T')[0]
      if (form.date < today) errs.date = 'Booking date cannot be in the past.'
    }
    if (!form.startTime) errs.startTime = 'Start time is required.'
    if (!form.endTime) errs.endTime = 'End time is required.'
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      errs.endTime = 'End time must be after start time.'
    }
    if (!form.purpose || !form.purpose.trim()) {
      errs.purpose = 'Purpose is required.'
    } else if (form.purpose.trim().length < 3) {
      errs.purpose = 'Purpose must be at least 3 characters.'
    } else if (form.purpose.trim().length > 500) {
      errs.purpose = 'Purpose must not exceed 500 characters.'
    }
    if (form.expectedAttendees !== '' && form.expectedAttendees !== null) {
      const num = parseInt(form.expectedAttendees, 10)
      if (isNaN(num) || num < 1) errs.expectedAttendees = 'Attendees must be a positive number.'
    }

    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')

    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    try {
      await onSubmit({
        ...form,
        purpose: form.purpose.trim(),
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees, 10) : null,
      })
    } catch (err) {
      const parsed = parseApiError(err)
      if (parsed.fieldErrors) {
        setErrors(prev => ({ ...prev, ...parsed.fieldErrors }))
      }
      setApiError(parsed.message)
    }
  }

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
        : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100'
    }`

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {apiError && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{apiError}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Resource *</label>
        <select name="resourceId" value={form.resourceId} onChange={handleChange} className={inputClass('resourceId')}>
          <option value="">Select a resource</option>
          {resources.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.type})
            </option>
          ))}
        </select>
        {errors.resourceId && <p className="mt-1 text-xs text-rose-600">{errors.resourceId}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} min={today} className={inputClass('date')} />
          {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Start Time *</label>
          <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className={inputClass('startTime')} />
          {errors.startTime && <p className="mt-1 text-xs text-rose-600">{errors.startTime}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">End Time *</label>
          <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className={inputClass('endTime')} />
          {errors.endTime && <p className="mt-1 text-xs text-rose-600">{errors.endTime}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Purpose *</label>
        <textarea
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          rows={3}
          maxLength={500}
          className={inputClass('purpose')}
          placeholder="Describe the purpose of this booking (3–500 characters)"
        />
        <div className="mt-1 flex justify-between">
          {errors.purpose ? <p className="text-xs text-rose-600">{errors.purpose}</p> : <span />}
          <span className="text-xs text-gray-400">{form.purpose.length}/500</span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Expected Attendees</label>
        <input
          type="number"
          name="expectedAttendees"
          value={form.expectedAttendees}
          onChange={handleChange}
          min={1}
          className={inputClass('expectedAttendees')}
          placeholder="Optional"
        />
        {errors.expectedAttendees && <p className="mt-1 text-xs text-rose-600">{errors.expectedAttendees}</p>}
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

function parseApiError(err) {
  try {
    const data = JSON.parse(err.message)
    if (data.fieldErrors && Array.isArray(data.fieldErrors)) {
      const fieldErrors = {}
      for (const fe of data.fieldErrors) {
        fieldErrors[fe.field] = fe.message
      }
      return { message: data.error || 'Validation failed', fieldErrors }
    }
    return { message: data.error || data.message || err.message }
  } catch {
    return { message: err.message || 'Something went wrong' }
  }
}

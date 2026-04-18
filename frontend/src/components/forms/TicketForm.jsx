import { useEffect, useState } from 'react'
import { getJson } from '../../services/api.js'
import AttachmentUploader from '../ticket/AttachmentUploader.jsx'

const CATEGORIES = ['IT_EQUIPMENT', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'FURNITURE', 'CLEANING', 'SECURITY', 'OTHER']

export default function TicketForm({ onSubmit, loading }) {
  const [resources, setResources] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    resourceId: '',
    location: '',
    priority: 'MEDIUM',
    contactInfo: '',
  })
  const [attachments, setAttachments] = useState([])
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
    if (!form.title.trim()) errs.title = 'Title is required.'
    else if (form.title.length > 200) errs.title = 'Title must not exceed 200 characters.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters.'
    else if (form.description.length > 2000) errs.description = 'Description must not exceed 2000 characters.'
    if (!form.category) errs.category = 'Category is required.'
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
        title: form.title.trim(),
        description: form.description.trim(),
        contactInfo: form.contactInfo.trim() || undefined,
        location: form.location.trim() || undefined,
        resourceId: form.resourceId || undefined,
        attachments: attachments.length ? attachments : undefined,
      })
    } catch (err) {
      const parsed = parseApiError(err)
      if (parsed.fieldErrors) setErrors(prev => ({ ...prev, ...parsed.fieldErrors }))
      setApiError(parsed.message)
    }
  }

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
        : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {apiError && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{apiError}</div>}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
        <input name="title" value={form.title} onChange={handleChange} maxLength={200} className={inputClass('title')} placeholder="Brief summary of the issue" />
        {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className={inputClass('category')}>
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-xs text-rose-600">{errors.category}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className={inputClass('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} maxLength={2000} className={inputClass('description')} placeholder="Describe the issue in detail (min 10 characters)" />
        <div className="mt-1 flex justify-between">
          {errors.description ? <p className="text-xs text-rose-600">{errors.description}</p> : <span />}
          <span className="text-xs text-gray-400">{form.description.length}/2000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Related Resource</label>
          <select name="resourceId" value={form.resourceId} onChange={handleChange} className={inputClass('resourceId')}>
            <option value="">None</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className={inputClass('location')} placeholder="e.g., Building A, Room 201" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Contact Info</label>
        <input name="contactInfo" value={form.contactInfo} onChange={handleChange} maxLength={200} className={inputClass('contactInfo')} placeholder="Phone or email for follow-up" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Attachments (max 3 images)</label>
        <AttachmentUploader attachments={attachments} onChange={setAttachments} />
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Creating…' : 'Create Ticket'}
      </button>
    </form>
  )
}

function parseApiError(err) {
  try {
    const data = JSON.parse(err.message)
    if (data.fieldErrors && Array.isArray(data.fieldErrors)) {
      const fieldErrors = {}
      for (const fe of data.fieldErrors) fieldErrors[fe.field] = fe.message
      return { message: data.error || 'Validation failed', fieldErrors }
    }
    return { message: data.error || data.message || err.message }
  } catch {
    return { message: err.message || 'Something went wrong' }
  }
}

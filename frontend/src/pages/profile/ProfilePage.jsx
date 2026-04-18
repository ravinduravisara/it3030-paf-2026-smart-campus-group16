import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { getJson, putJson, deleteJson } from '../../services/api.js'

function getInitials(user) {
  const source = String(user?.name || user?.username || user?.email || 'U').trim()
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function ProfilePage() {
  const { user, logout, establishSession } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: '', studentId: '', profilePhoto: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getJson('/api/profile/me')
      .then((data) => {
        setProfile(data)
        setForm({ username: data.name || '', studentId: data.studentId || '', profilePhoto: '' })
      })
      .catch(() => {})
  }, [])

  const display = profile || user

  function handleLogout() {
    logout()
    window.location.hash = '#home'
  }

  function handleEdit() {
    setEditing(true)
    setError('')
    setSuccess('')
  }

  function handleCancel() {
    setEditing(false)
    setForm({ username: profile?.name || '', studentId: profile?.studentId || '', profilePhoto: '' })
    setError('')
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must not exceed 5 MB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, profilePhoto: reader.result }))
    reader.readAsDataURL(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const body = { username: form.username.trim(), studentId: form.studentId.trim() }
      if (form.profilePhoto) body.profilePhoto = form.profilePhoto
      const updated = await putJson('/api/profile/me', body)
      setProfile(updated)
      setForm({ username: updated.name || '', studentId: updated.studentId || '', profilePhoto: '' })
      setEditing(false)
      setSuccess('Profile updated successfully.')
      // sync auth context
      const token = localStorage.getItem('sc.accessToken')
      if (token) {
        establishSession({
          token: JSON.parse(token),
          user: { ...user, name: updated.name, studentId: updated.studentId, profilePhoto: updated.profilePhoto },
        })
      }
    } catch (err) {
      setError(err?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setError('')
    try {
      await deleteJson('/api/profile/me')
      logout()
      window.location.hash = '#home'
    } catch (err) {
      setError(err?.message || 'Failed to delete account.')
      setDeleting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {display?.profilePhoto ? (
            <img
              src={display.profilePhoto}
              alt="Profile"
              className="h-16 w-16 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400 text-xl font-black text-white shadow-lg shadow-violet-300/40">
              {getInitials(display)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Your Profile
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {display?.name || display?.username || 'SmartCampus User'}
            </h2>
            <p className="text-sm text-slate-600">
              Manage your account details.
            </p>
          </div>
        </div>
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">
          {display?.role || 'USER'}
        </span>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
      )}

      {/* View mode */}
      {!editing && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Student ID</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{display?.studentId || 'Not set'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Display Name</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{display?.name || display?.username || 'Not available'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Email</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{display?.email || 'Not available'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Role</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{display?.role || 'USER'}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Edit Profile
            </button>
            <a
              href="#home"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Back to Home
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>

          {/* Delete account */}
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5">
            <h3 className="text-sm font-bold text-red-700">Danger Zone</h3>
            <p className="mt-1 text-sm text-red-600">Deleting your account is permanent. All your data will be removed and cannot be recovered.</p>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete My Account
              </button>
            ) : (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm font-semibold text-red-700">Are you sure?</span>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit mode */}
      {editing && (
        <form onSubmit={handleSave} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Student ID</label>
            <input
              type="text"
              value={form.studentId}
              onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={display?.email || ''}
              disabled
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-indigo-500/20 focus:ring-4"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )
}

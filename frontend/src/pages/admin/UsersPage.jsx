import { useEffect, useState } from 'react'
import { Users, ShieldCheck, User, Search, Trash2, Ban, ShieldAlert } from 'lucide-react'
import { getJson, putJson, patchJson, deleteJson } from '../../services/api.js'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState(null) // { type, userId, userName }

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    setError('')
    try {
      const data = await getJson('/api/users')
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteJson(`/api/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (e) {
      setError(e?.message || 'Failed to delete user')
    } finally {
      setConfirm(null)
    }
  }

  async function handleRoleChange(id, newRole) {
    try {
      const updated = await putJson(`/api/users/${id}/role`, { role: newRole })
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u)))
    } catch (e) {
      setError(e?.message || 'Failed to update role')
    }
  }

  async function handleToggleBlock(id) {
    try {
      const updated = await patchJson(`/api/users/${id}/block`)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, blocked: updated.blocked } : u)))
    } catch (e) {
      setError(e?.message || 'Failed to toggle block')
    } finally {
      setConfirm(null)
    }
  }

  const filtered = users.filter((u) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.studentId || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    )
  })

  const adminCount = users.filter((u) => u.role === 'ADMIN').length
  const userCount = users.filter((u) => u.role !== 'ADMIN').length
  const verifiedCount = users.filter((u) => u.verified).length

  return (
    <section className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Users
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Account management
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Monitor accounts, permissions, and access status.
          </p>
        </div>
        <a
          href="#admin"
          className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
        >
          ← Back to Dashboard
        </a>
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-600">Total users</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{adminCount}</div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{verifiedCount}/{users.length}</div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, student ID, or role…"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none ring-indigo-500/20 focus:ring-4"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Users table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Student ID</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    Loading users…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    {search.trim() ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 ${u.blocked ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.profilePhoto ? (
                          <img
                            src={u.profilePhoto}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                            {(u.username || u.email || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {u.username || '—'}
                          </div>
                          <div className="text-xs text-gray-500">{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{u.studentId || '—'}</td>
                    <td className="px-6 py-4 text-gray-700">{u.email || '—'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role || 'USER'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold outline-none ring-indigo-500/20 focus:ring-4"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {u.blocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          Blocked
                        </span>
                      ) : u.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setConfirm({
                              type: 'block',
                              userId: u.id,
                              userName: u.username || u.email,
                              blocked: u.blocked,
                            })
                          }
                          title={u.blocked ? 'Unblock user' : 'Block user'}
                          className={`rounded-lg p-2 text-sm transition ${
                            u.blocked
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                          }`}
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({
                              type: 'delete',
                              userId: u.id,
                              userName: u.username || u.email,
                            })
                          }
                          title="Delete user"
                          className="rounded-lg bg-rose-50 p-2 text-sm text-rose-600 transition hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-xs text-gray-500">
            Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
            {confirm.type === 'delete' ? (
              <>
                <h3 className="text-lg font-bold text-gray-900">Delete user</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-semibold">{confirm.userName}</span>? This action cannot be
                  undone.
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => setConfirm(null)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(confirm.userId)}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900">
                  {confirm.blocked ? 'Unblock' : 'Block'} user
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {confirm.blocked
                    ? `Unblock ${confirm.userName}? They will be able to access the platform again.`
                    : `Block ${confirm.userName}? They will no longer be able to access the platform.`}
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => setConfirm(null)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleToggleBlock(confirm.userId)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                      confirm.blocked
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {confirm.blocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

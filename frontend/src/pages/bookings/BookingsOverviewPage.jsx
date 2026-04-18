import { useState } from 'react'
import { CalendarPlus, ClipboardList, ListChecks } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useBookings } from '../../hooks/useBookings.js'
import BookingCard from '../../components/booking/BookingCard.jsx'
import BookingTable from '../../components/booking/BookingTable.jsx'
import BookingForm from '../../components/forms/BookingForm.jsx'
import BookingApprovalModal from '../../components/booking/BookingApprovalModal.jsx'

const TABS = [
  { key: 'my', label: 'My Bookings', icon: ClipboardList },
  { key: 'create', label: 'New Booking', icon: CalendarPlus },
]

const ADMIN_TABS = [
  ...TABS,
  { key: 'review', label: 'Review Bookings', icon: ListChecks },
]

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function BookingsOverviewPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const tabs = isAdmin ? ADMIN_TABS : TABS

  const [tab, setTab] = useState('my')
  const [statusFilter, setStatusFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [cancelId, setCancelId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  const filterForApi = tab === 'review' && statusFilter ? statusFilter : undefined
  const { bookings, loading, error, reload, create, decide, cancel } = useBookings(filterForApi)

  async function handleCreate(data) {
    setCreating(true)
    try {
      await create(data)
      setTab('my')
    } finally {
      setCreating(false)
    }
  }

  async function handleDecide(id, action) {
    const booking = bookings.find(b => b.id === id)
    if (booking) setReviewBooking(booking)
  }

  async function handleDecideSubmit(id, action, reason) {
    await decide(id, action, reason)
    setReviewBooking(null)
  }

  async function handleCancelSubmit() {
    if (!cancelId) return
    await cancel(cancelId, cancelReason)
    setCancelId(null)
    setCancelReason('')
  }

  const myBookings = bookings

  return (
    <section id="bookings" className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Bookings</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Booking Management
          </h2>
        </div>
      </div>

      {/* Tab bar */}
      <div className="mt-6 flex gap-1 rounded-2xl bg-gray-100 p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); if (t.key !== 'review') setStatusFilter('') }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {/* My Bookings tab */}
      {tab === 'my' && (
        <div className="mt-6">
          {loading ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading bookings…</p>
          ) : myBookings.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white py-16 text-center shadow-sm">
              <ClipboardList className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No bookings yet. Create one to get started!</p>
              <button
                onClick={() => setTab('create')}
                className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                New Booking
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {myBookings.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  isAdmin={false}
                  onCancel={(id) => { setCancelId(id); setCancelReason('') }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Booking tab */}
      {tab === 'create' && (
        <div className="mt-6 mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Create a New Booking</h3>
          <p className="mb-6 text-sm text-gray-500">Select a resource and pick your time slot.</p>
          <BookingForm onSubmit={handleCreate} loading={creating} />
        </div>
      )}

      {/* Admin Review tab */}
      {tab === 'review' && isAdmin && (
        <div className="mt-6">
          {/* Filter bar */}
          <div className="mb-4 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s === 'ALL' ? '' : s)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  (s === 'ALL' && !statusFilter) || statusFilter === s
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading bookings…</p>
          ) : (
            <BookingTable
              bookings={bookings}
              isAdmin
              onDecide={handleDecide}
              onCancel={(id) => { setCancelId(id); setCancelReason('') }}
            />
          )}
        </div>
      )}

      {/* Approval modal */}
      {reviewBooking && (
        <BookingApprovalModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={handleDecideSubmit}
        />
      )}

      {/* Cancel confirmation dialog */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Cancel Booking</h3>
            <p className="mt-1 text-sm text-gray-500">Are you sure you want to cancel this booking?</p>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Reason (optional)"
              rows={2}
              className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => { setCancelId(null); setCancelReason('') }}
                className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep
              </button>
              <button
                onClick={handleCancelSubmit}
                className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { fetchBookings, createBooking, decideBooking, cancelBooking } from '../api/bookingApi.js'

export function useBookings(statusFilter) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchBookings(statusFilter)
      setBookings(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  async function create(data) {
    const result = await createBooking(data)
    await load()
    return result
  }

  async function decide(id, action, reason) {
    const result = await decideBooking(id, action, reason)
    await load()
    return result
  }

  async function cancel(id, reason) {
    const result = await cancelBooking(id, reason)
    await load()
    return result
  }

  return { bookings, loading, error, reload: load, create, decide, cancel }
}

import { useCallback, useEffect, useState } from 'react'
import { fetchTickets, createTicket, updateTicketStatus, assignTicket } from '../api/ticketApi.js'

export function useTickets(filters) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchTickets(filters)
      setTickets(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [filters?.status, filters?.priority, filters?.category, filters?.assignedTo])

  useEffect(() => { load() }, [load])

  async function create(data) {
    const result = await createTicket(data)
    await load()
    return result
  }

  async function statusUpdate(id, data) {
    const result = await updateTicketStatus(id, data)
    await load()
    return result
  }

  async function assign(id, assignedTo) {
    const result = await assignTicket(id, assignedTo)
    await load()
    return result
  }

  return { tickets, loading, error, reload: load, create, statusUpdate, assign }
}

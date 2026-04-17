import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export default function TechnicianRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  const hasAccess = isAuthenticated && ['TECHNICIAN', 'ADMIN'].includes(String(user?.role || '').toUpperCase())

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = '#login'
      return
    }

    if (!hasAccess) {
      window.location.hash = '#home'
    }
  }, [hasAccess, isAuthenticated])

  if (!isAuthenticated || !hasAccess) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm">
        Restricted area. Redirecting…
      </section>
    )
  }

  return children
}
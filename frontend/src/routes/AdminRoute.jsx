import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth()
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = '#login'
      return
    }

    if (!isAdmin) {
      window.location.hash = '#home'
    }
  }, [isAdmin, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm">
        Admin login required. Redirecting to the sign-in page…
      </section>
    )
  }

  if (!isAdmin) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
        Access denied. Only administrators can view this page.
      </section>
    )
  }

  return children
}
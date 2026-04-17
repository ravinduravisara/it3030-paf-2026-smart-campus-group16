import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = '#login'
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm">
        Login required. Redirecting to the sign-in page…
      </section>
    )
  }

  return children
}
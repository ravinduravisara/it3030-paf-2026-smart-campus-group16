import { useEffect, useState } from 'react'
import Footer from './components/common/Footer.jsx'
import Navbar from './components/common/Navbar.jsx'
import BookingsOverviewPage from './pages/bookings/BookingsOverviewPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import VerifyOtpPage from './pages/auth/VerifyOtpPage.jsx'
import HomePage from './pages/home/HomePage.jsx'
import ResourcesOverviewPage from './pages/resources/ResourcesOverviewPage.jsx'
import TicketsOverviewPage from './pages/tickets/TicketsOverviewPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import UsersPage from './pages/admin/UsersPage.jsx'
import AdminSendNotificationPage from './pages/admin/AdminSendNotificationPage.jsx'
import NotificationsPage from './pages/notifications/NotificationsPage.jsx'
import { useAuth } from './hooks/useAuth.js'
import AdminRoute from './routes/AdminRoute.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

function getRouteFromHash(hash) {
  const raw = (hash || '').replace(/^#/, '')
  const [route] = raw.split('?')
  return route || 'home'
}

export default function App() {
  const [route, setRoute] = useState(() => getRouteFromHash(window.location.hash))
  const { establishSession } = useAuth()

  useEffect(() => {
    function onHashChange() {
      setRoute(getRouteFromHash(window.location.hash))
    }

    window.addEventListener('hashchange', onHashChange)

    const raw = (window.location.hash || '').replace(/^#/, '')
    const [, query = ''] = raw.split('?')
    const params = new URLSearchParams(query)
    const token = params.get('token')
    const email = params.get('email')
    const name = params.get('name')
    const role = params.get('role')

    if (token) {
      const nextRoute = role === 'ADMIN' ? 'admin' : 'home'
      establishSession({
        token,
        user: {
          name: name || email || 'SmartCampus User',
          email: email || 'user@campus.edu',
          username: name || email || 'user@campus.edu',
          role: role || 'USER',
        },
      })
      setRoute(nextRoute)
      window.location.hash = `#${nextRoute}`
      return () => window.removeEventListener('hashchange', onHashChange)
    }

    if (!window.location.hash) {
      window.location.hash = '#home'
      setRoute('home')
    } else {
      onHashChange()
    }

    return () => window.removeEventListener('hashchange', onHashChange)
  }, [establishSession])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-gray-900">
      <Navbar />

      <main className={(route === 'login' || route === 'register' || route === 'verify-otp') ? 'flex-1' : 'mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8'}>
        {route === 'login' ? (
          <LoginPage />
        ) : route === 'register' ? (
          <RegisterPage />
        ) : route === 'verify-otp' ? (
          <VerifyOtpPage />
        ) : route === 'admin' ? (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ) : route === 'users' ? (
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        ) : route === 'admin/notification' ? (
          <AdminRoute>
            <AdminSendNotificationPage />
          </AdminRoute>
        ) : route === 'resources' ? (
          <ProtectedRoute>
            <ResourcesOverviewPage />
          </ProtectedRoute>
        ) : route === 'bookings' ? (
          <ProtectedRoute>
            <BookingsOverviewPage />
          </ProtectedRoute>
        ) : route === 'tickets' ? (
          <ProtectedRoute>
            <TicketsOverviewPage />
          </ProtectedRoute>
        ) : route === 'profile' ? (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ) : route === 'notifications' ? (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ) : (
          <HomePage />
        )}
      </main>

      <Footer />
    </div>
  )
}
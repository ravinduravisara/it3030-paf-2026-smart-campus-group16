import { useEffect, useState } from 'react'
import Footer from './components/common/Footer.jsx'
import Navbar from './components/common/Navbar.jsx'
import BookingsOverviewPage from './pages/bookings/BookingsOverviewPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import HomePage from './pages/home/HomePage.jsx'
import ResourcesOverviewPage from './pages/resources/ResourcesOverviewPage.jsx'
import TicketsOverviewPage from './pages/tickets/TicketsOverviewPage.jsx'
import { useAuth } from './hooks/useAuth.js'

function getRouteFromHash(hash) {
  const raw = (hash || '').replace(/^#/, '')
  const [route] = raw.split('?')
  return route || 'home'
}

export default function App() {
  const [route, setRoute] = useState(() => getRouteFromHash(window.location.hash))

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#home'
      setRoute('home')
      return
    }

    function onHashChange() {
      setRoute(getRouteFromHash(window.location.hash))
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-gray-900">
      <Navbar />

      <main className={(route === 'login' || route === 'register') ? 'flex-1' : 'mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8'}>
        {route === 'login' ? (
          <LoginPage />
        ) : route === 'register' ? (
          <RegisterPage />
        ) : route === 'admin' ? (
          <AdminDashboardPage />
        ) : route === 'resources' ? (
          <ResourcesOverviewPage />
        ) : route === 'bookings' ? (
          <BookingsOverviewPage />
        ) : route === 'tickets' ? (
          <TicketsOverviewPage />
        ) : (
          <HomePage />
        )}
      </main>

      <Footer />
    </div>
  )
}
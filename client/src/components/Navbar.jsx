import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'

export default function Navbar() {
  const { strings } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem('sakhi-token')))
  const [userName, setUserName] = useState('Sakhi')

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem('sakhi-token')))
    const storedUser = localStorage.getItem('sakhi-user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUserName(parsedUser.name || parsedUser.email || 'Sakhi')
      } catch {
        setUserName('Sakhi')
      }
    } else {
      setUserName('Sakhi')
    }
  }, [location])

  const handleSignOut = () => {
    localStorage.removeItem('sakhi-token')
    localStorage.removeItem('sakhi-user')
    setIsLoggedIn(false)
    navigate('/login')
  }

  const links = [
    { name: strings.nav.home, to: '/' },
    { name: strings.nav.chat, to: '/chat' },
    { name: strings.nav.budget, to: '/budget' },
    { name: strings.nav.business, to: '/business' },
  ]

  return (
    <header className="bg-slate-950 text-slate-100 shadow-2xl sticky top-0 z-40">
      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            {userName}
          </div>
          <nav className="hidden md:flex items-center gap-3 text-sm text-slate-300">
            {links.slice(0, 4).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 transition ${
                    isActive ? 'bg-fuchsia-600 text-white shadow-lg' : 'hover:bg-white/10'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <span className="text-slate-400">Search</span>
          </div>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/dashboard"
                className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Dashboard
              </NavLink>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
              >
                Sign out
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
            >
              Sign in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}

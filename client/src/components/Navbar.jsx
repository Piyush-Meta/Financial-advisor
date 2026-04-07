import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { useVoiceCommands } from '../contexts/VoiceCommandContext.jsx'
import LanguageSelector from './LanguageSelector.jsx'

export default function Navbar() {
  const { strings } = useLanguage()
  const { supported, enabled, listening, mode, setMode, toggle, startPushToTalk, stopPushToTalk, lastCommand } = useVoiceCommands()
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
            <span className="text-slate-400">{strings.common.search}</span>
          </div>
          <LanguageSelector className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={toggle}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              enabled
                ? 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-400'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={supported ? (enabled ? 'Turn off voice commands' : 'Turn on voice commands') : 'Voice commands not supported'}
          >
            <span>{enabled ? '🎙️' : '🎤'}</span>
            <span>{enabled ? (listening ? 'Voice active' : 'Voice ready') : 'Voice off'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'continuous' ? 'push' : 'continuous')}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            title="Switch voice mode"
          >
            <span>{mode === 'continuous' ? 'Always listening' : 'Push-to-talk'}</span>
          </button>
          <button
            type="button"
            onMouseDown={startPushToTalk}
            onMouseUp={stopPushToTalk}
            onMouseLeave={stopPushToTalk}
            onTouchStart={startPushToTalk}
            onTouchEnd={stopPushToTalk}
            onTouchCancel={stopPushToTalk}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
            title="Hold to speak"
            disabled={!supported}
          >
            <span>Hold mic</span>
          </button>
          <span className={`inline-flex h-3 w-3 rounded-full ${listening ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'}`} />
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/dashboard"
                className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {strings.common.dashboard}
              </NavLink>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
              >
                {strings.common.signOut}
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="rounded-full bg-fuchsia-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
            >
              {strings.common.signIn}
            </NavLink>
          )}
        </div>
        {enabled && lastCommand && (
          <div className="w-full text-right text-[11px] text-slate-400 sm:-mt-1">
            Last command: {lastCommand}
          </div>
        )}
      </div>
    </header>
  )
}

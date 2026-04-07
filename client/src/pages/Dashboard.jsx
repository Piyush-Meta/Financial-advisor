import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import namasteImage from '../assets/namaste.png'

export default function Dashboard() {
  const { strings } = useLanguage()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const dashboard = strings.dashboard

  useEffect(() => {
    const stored = localStorage.getItem('sakhi-user')
    if (!stored) {
      navigate('/login')
      return
    }

    try {
      setUser(JSON.parse(stored))
    } catch {
      localStorage.removeItem('sakhi-user')
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('sakhi-token')
    localStorage.removeItem('sakhi-user')
    navigate('/login')
  }

  return (
    <div className="min-h-[calc(100vh-96px)] py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-4xl bg-white/95 p-10 shadow-2xl ring-1 ring-fuchsia-100">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-600">{dashboard.title}</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">{dashboard.title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                {user ? dashboard.greeting.replace('{name}', user.name || user.email || 'Sakhi') : dashboard.loading}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={namasteImage}
                alt="Namaste welcome illustration"
                className="h-72 w-full max-w-md rounded-4xl object-contain shadow-2xl ring-1 ring-slate-200"
              />
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div />
            <div className="flex flex-col gap-3 sm:items-end">
              <span className="rounded-full bg-fuchsia-50 px-4 py-2 text-sm font-semibold text-fuchsia-700 shadow-sm">
                {dashboard.signedInAs.replace('{name}', user?.name || user?.email || 'guest')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.cards.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => navigate(card.to)}
              className="rounded-4xl border border-slate-200 bg-slate-950 p-8 text-left text-white shadow-2xl transition hover:-translate-y-1 hover:bg-slate-900 hover:shadow-[0_20px_60px_rgba(15,23,42,0.25)]"
            >
              <div className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-300">
                {card.title}
              </div>
              <p className="text-base leading-7 text-slate-200">{card.description}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-4xl bg-white p-8 shadow-xl ring-1 ring-fuchsia-100">
            <h2 className="text-2xl font-semibold text-slate-950">{dashboard.activityTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{dashboard.activityDescription}</p>
            <ul className="mt-8 space-y-4">
              {dashboard.activityItems.map((item) => (
                <li key={item.title} className={item.helperTitle ? 'flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5' : 'flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5'}>
                  <div className={item.helperTitle ? 'flex items-start gap-4' : 'flex items-start gap-4'}>
                    <span className={`mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl ${item.color} text-sm font-semibold text-white`}>{item.badge}</span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                  {item.helperTitle && (
                    <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-600 text-white text-lg">🤖</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{item.helperTitle}</p>
                        <p className="text-xs text-slate-500">{item.helperDescription}</p>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <aside className="rounded-4xl bg-fuchsia-950 p-8 text-white shadow-2xl ring-1 ring-fuchsia-100">
            <h2 className="text-2xl font-semibold">{dashboard.helpTitle}</h2>
            <p className="mt-4 text-sm leading-6 text-fuchsia-200">{dashboard.helpDescription}</p>
            <div className="mt-8 space-y-4 rounded-3xl bg-white/10 p-6">
              <p className="text-sm font-semibold text-white">{dashboard.helpTipTitle}</p>
              <p className="text-sm leading-6 text-fuchsia-100">{dashboard.helpTipDescription}</p>
            </div>
          </aside>
        </div>

        <div className="rounded-4xl bg-white/95 p-8 shadow-2xl ring-1 ring-fuchsia-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{dashboard.accountActionsTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">{dashboard.accountActionsDescription}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
            >
              {dashboard.signOutButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

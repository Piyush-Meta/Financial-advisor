import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import namasteImage from '../assets/namaste.png'

const dashboardCards = [
  {
    title: 'AI assistant',
    description: 'Ask questions, get tailored advice, and receive instant financial help with your personal assistant.',
    to: '/chat',
  },
  {
    title: 'Money overview',
    description: 'Track your balances, savings goals, and spending insights in one easy dashboard.',
    to: '/budget',
  },
  {
    title: 'Business suggestions',
    description: 'Receive practical business ideas and growth tips for your small enterprise.',
    to: '/business',
  },
  {
    title: 'Learning cards',
    description: 'Review simple, actionable financial lessons curated for your next steps.',
    to: '/chat',
  },
  {
    title: 'Voice interaction',
    description: 'Use voice commands to interact with the system and get hands-free guidance.',
    to: '/chat',
  },
]

export default function Dashboard() {
  const { strings } = useLanguage()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

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
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-fuchsia-600">Dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">Your financial hub</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                {user ? `Hello ${user.name || user.email}, here are your latest tools and insights.` : 'Loading your dashboard...' }
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
                Signed in as {user?.name || user?.email || 'guest'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {dashboardCards.map((card) => (
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
            <h2 className="text-2xl font-semibold text-slate-950">Your latest activity</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Quick access to the tools you need most after signing in.</p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-fuchsia-600 text-sm font-semibold text-white">AI</span>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">AI assistant</h3>
                  <p className="mt-1 text-sm text-slate-600">Ask your personalized finance coach for advice anytime.</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-sm font-semibold text-white">$</span>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Money overview</h3>
                  <p className="mt-1 text-sm text-slate-600">Review your overall balance, spending, and savings goals.</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-semibold text-white">B</span>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Business suggestions</h3>
                  <p className="mt-1 text-sm text-slate-600">Get actionable ideas and tips for your business growth.</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-sm font-semibold text-white">L</span>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Learning cards</h3>
                  <p className="mt-1 text-sm text-slate-600">Browse quick learning tips that strengthen your financial skills.</p>
                </div>
              </li>
              <li className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-600 text-sm font-semibold text-white">V</span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">Voice interaction</h3>
                    <p className="mt-1 text-sm text-slate-600">Use voice commands to interact with your dashboard hands-free.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-600 text-white text-lg">🤖</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">How can I help you?</p>
                    <p className="text-xs text-slate-500">Ask the assistant to start voice chat.</p>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <aside className="rounded-4xl bg-fuchsia-950 p-8 text-white shadow-2xl ring-1 ring-fuchsia-100">
            <h2 className="text-2xl font-semibold">Need help?</h2>
            <p className="mt-4 text-sm leading-6 text-fuchsia-200">Visit the AI assistant anytime or use the voice interaction feature to get instant guidance.</p>
            <div className="mt-8 space-y-4 rounded-3xl bg-white/10 p-6">
              <p className="text-sm font-semibold text-white">Tip</p>
              <p className="text-sm leading-6 text-fuchsia-100">Start with the AI assistant if you want help creating a budget or exploring new business ideas.</p>
            </div>
          </aside>
        </div>

        <div className="rounded-4xl bg-white/95 p-8 shadow-2xl ring-1 ring-fuchsia-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Account actions</h2>
              <p className="mt-2 text-sm text-slate-600">Use the button below when you are ready to sign out.</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

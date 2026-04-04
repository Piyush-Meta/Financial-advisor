import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import namasteImage from '../assets/namaste.png'

const featureCards = [
  {
    title: 'Smart savings planning',
    text: 'Build a simple budget that keeps savings first and expenses under control.',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Voice-first guidance',
    text: 'Ask questions naturally and get instant help in the language you prefer.',
    accent: 'from-fuchsia-500 to-violet-500',
  },
  {
    title: 'Business growth ideas',
    text: 'Get practical micro-business advice for dairy, tailoring, and local trade.',
    accent: 'from-sky-500 to-indigo-500',
  },
]

const aiCapabilities = [
  {
    title: 'Multilingual voice input',
    text: 'Speak in English, Hindi, Odia and more with natural transcription support.',
    icon: '🎙️',
  },
  {
    title: 'Native-language responses',
    text: 'The assistant replies in the selected language using native script when available.',
    icon: '🌐',
  },
  {
    title: 'Finance-focused suggestions',
    text: 'Answers stay centered on profit, cost reduction, saving, and practical next steps.',
    icon: '📊',
  },
]

const steps = [
  {
    title: 'Choose a language',
    text: 'Pick your preferred language from the glass-style selector at the top.',
  },
  {
    title: 'Ask by voice or text',
    text: 'Speak naturally or type a question about your business or monthly spending.',
  },
  {
    title: 'Act on clear guidance',
    text: 'Use the advice to improve profit, cut costs, and protect your savings.',
  },
]

export default function Home() {
  const { strings, language, setLanguage, languageNames } = useLanguage()
  const [userName, setUserName] = useState('Sakhi')

  const isLoggedIn = Boolean(localStorage.getItem('sakhi-token'))

  const topActions = useMemo(
    () => (isLoggedIn ? [{ label: 'Go to dashboard', to: '/dashboard' }] : [{ label: 'Get started', to: '/login' }, { label: 'Explore features', to: '/register' }]),
    [isLoggedIn]
  )

  useEffect(() => {
    if (isLoggedIn) {
      const storedUser = localStorage.getItem('sakhi-user')
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUserName(parsedUser.name || parsedUser.email || 'Sakhi')
        } catch {
          setUserName('Sakhi')
        }
      }
    }
  }, [isLoggedIn])

  return (
    <div className="min-h-[calc(100vh-96px)] bg-linear-to-br from-slate-950 via-fuchsia-950 to-indigo-950 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-5 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="grid items-center gap-10 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 shadow-lg">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-violet-500 text-sm font-bold text-white">✦</span>
                <span>{isLoggedIn ? `Welcome back, ${userName}` : 'Smart finance for rural builders'}</span>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Financial tools that feel premium, personal, and powerful.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
                  AI-driven advice, multilingual voice guidance, and business planning tools for rural women who want to grow income, save better, and make clearer money decisions.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                {topActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(168,85,247,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_60px_rgba(168,85,247,0.45)]"
                  >
                    {action.label}
                  </Link>
                ))}
                {!isLoggedIn && (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    Explore features
                  </Link>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  'Voice + text guidance',
                  'Business plan generator',
                  'Budget planning hub',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 shadow-lg">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl">
              <div className="absolute -left-4 top-24 z-10 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia-100">Growth score</p>
                <p className="mt-1 text-xl font-black">94/100</p>
              </div>

              <div className="absolute right-0 top-2 z-10 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-100">AI ready</p>
                <p className="mt-1 text-sm font-semibold">Voice, chat, plan</p>
              </div>

              <div className="rounded-[2.5rem] border border-white/10 bg-white/10 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-slate-900 via-fuchsia-950 to-violet-950 p-4 sm:p-6">
                  <div className="absolute left-6 top-6 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-3xl" />
                  <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    <div className="flex-1 space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-100">
                        <span className="text-base">✦</span>
                        Floating dashboard
                      </div>
                      <h2 className="max-w-md text-3xl font-black tracking-tight text-white sm:text-4xl">
                        AI finance that feels crafted, not generic.
                      </h2>
                      <p className="max-w-lg text-sm leading-6 text-slate-200 sm:text-base">
                        Use voice, create business plans, check savings, and see advice in a polished interface designed for demo impact.
                      </p>
                    </div>

                    <div className="relative mx-auto w-full max-w-sm">
                      <div className="absolute -left-3 top-10 rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-xl">
                        Daily advice
                      </div>
                      <div className="absolute -right-2 bottom-10 rounded-2xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 shadow-lg backdrop-blur-xl">
                        Savings plan
                      </div>
                      <img
                        src={namasteImage}
                        alt="Namaste greeting illustration"
                        className="w-full rounded-4xl object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-4xl border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-xl">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-fuchsia-100">Language selector</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.entries(languageNames).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setLanguage(key)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                        language === key
                          ? 'bg-linear-to-r from-fuchsia-500 to-violet-500 text-white shadow-[0_16px_30px_rgba(168,85,247,0.3)]'
                          : 'border border-white/15 bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="group rounded-4xl border border-white/10 bg-white/8 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.24)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.32)]"
            >
              <div className={`mb-5 h-12 w-12 rounded-2xl bg-linear-to-br ${card.accent} shadow-lg`} />
              <h2 className="text-2xl font-bold tracking-tight text-white">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-200">{card.text}</p>
            </article>
          ))}
        </section>

        <section className="rounded-4xl border border-white/10 bg-white/8 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-100">AI capabilities</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Built for voice, planning, and practical business advice.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-200">
              Strong enough for hackathon judging, simple enough for everyday use.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {aiCapabilities.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5 shadow-lg transition hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-500 to-violet-500 text-xl shadow-lg">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-200">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-4xl border border-white/10 bg-white/8 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-100">How it works</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">Three simple steps to better decisions.</h2>
            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-3xl bg-white/5 p-4 shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-violet-500 font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-slate-200">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-white/10 bg-linear-to-br from-fuchsia-600 via-violet-600 to-indigo-700 p-6 text-white shadow-[0_24px_80px_rgba(124,58,237,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-100">CTA footer</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Ready to build a smarter money flow?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-fuchsia-50/90">
              Jump into chat, generate a business plan, or open your dashboard to keep improving your budget and profit strategy.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={isLoggedIn ? '/dashboard' : '/login'}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-fuchsia-50"
              >
                {isLoggedIn ? 'Open dashboard' : 'Get started'}
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Go to chat
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
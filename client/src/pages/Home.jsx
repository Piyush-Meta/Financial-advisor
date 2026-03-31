import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import namasteImage from '../assets/namaste.png'

export default function Home() {
  const { strings, language, setLanguage, languageNames } = useLanguage()
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationStage, setAnimationStage] = useState(1)
  const [userName, setUserName] = useState('Sakhi')

  const isLoggedIn = Boolean(localStorage.getItem('sakhi-token'))

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

  useEffect(() => {
    const hasSeen = localStorage.getItem('sakhi-welcome-seen')
    if (!hasSeen) {
      setShowAnimation(true)

      const toNamaste = setTimeout(() => setAnimationStage(2), 1400)

      const endAnimation = setTimeout(() => {
        setShowAnimation(false)
        setAnimationStage(1)
        localStorage.setItem('sakhi-welcome-seen', 'true')
      }, 3200)

      return () => {
        clearTimeout(toNamaste)
        clearTimeout(endAnimation)
      }
    }
  }, [])

  return (
    <div className="relative space-y-10 py-6">

      {/* First Time Welcome Animation */}
      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-fuchsia-900/95 px-6 py-12 text-white backdrop-blur-xl">
          <div className="relative flex h-96 w-full max-w-2xl flex-col items-center justify-center gap-4 rounded-[3rem] border border-white/20 bg-white/10 px-10 py-12 text-center shadow-[0_40px_120px_rgba(168,85,247,0.32)]">

            <span className="text-xs uppercase tracking-[0.45em] text-fuchsia-200">
              {isLoggedIn ? `${userName} Finance` : 'Sakhi Finance'}
            </span>

            <div className="relative h-28 overflow-hidden">
              <span
                className={`absolute inset-0 flex items-center justify-center text-[3.5rem] font-black transition-all duration-700 ${
                  animationStage === 1
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }`}
              >
                Welcome
              </span>

              <span
                className={`absolute inset-0 flex items-center justify-center text-[3.5rem] font-black transition-all duration-700 ${
                  animationStage === 2
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }`}
              >
                Namaste 🙏
              </span>
            </div>

            {/* Image appears in stage 2 */}
            <img
              src={namasteImage}
              alt="Namaste"
              className={`h-40 transition-all duration-700 ${
                animationStage === 2
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              }`}
            />

          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-fuchsia-950 to-slate-900 px-6 py-16 text-white shadow-2xl ring-1 ring-white/10 sm:px-10">

        <div className="grid gap-8 lg:grid-cols-2 items-center">

          {/* Left Content */}
          <div className="space-y-6">

            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
              Financial independence for Lakshmi and millions like her
            </h1>

            <p className="max-w-xl text-lg text-slate-300">
              AI-driven advice, local-language guidance, micro-investment coaching
              and budgeting tools built for rural women who are new to finance.
            </p>

            {/* Language selector */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-fuchsia-200">
                Choose your language
              </h2>

              <div className="mt-4 flex gap-3 flex-wrap">
                {Object.entries(languageNames).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setLanguage(key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      language === key
                        ? 'bg-fuchsia-600 text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="rounded-full bg-fuchsia-600 px-6 py-3 font-semibold hover:bg-fuchsia-500"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-full bg-fuchsia-600 px-6 py-3 font-semibold hover:bg-fuchsia-500"
                  >
                    Get Started
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-full border border-white/20 px-6 py-3 font-semibold hover:bg-white/10"
                  >
                    Explore
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center">
            <img
              src={namasteImage}
              alt="Namaste"
              className="w-full max-w-xl object-contain drop-shadow-2xl"
            />
          </div>

        </div>
      </section>
    </div>
  )
}
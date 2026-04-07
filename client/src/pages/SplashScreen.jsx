import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import namaste from '../assets/namaste.png'

export default function SplashScreen({ onComplete }) {
  const { strings } = useLanguage()
  const navigate = useNavigate()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2400),
      setTimeout(() => setStage(3), 3400),
      setTimeout(() => {
        localStorage.setItem('sakhi_seen_intro', 'true')
        onComplete()
        navigate('/dashboard')
      }, 4200),
    ]

    return () => timers.forEach(clearTimeout)
  }, [navigate, onComplete])

  return (
    <div className={`fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#0b1228] px-4 py-8 text-white transition-opacity duration-500 ${stage === 3 ? 'opacity-0' : 'opacity-100'}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at top, rgba(236,72,153,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(168,85,247,0.22), transparent 30%), linear-gradient(180deg, #110f2d 0%, #0b1228 100%)',
        }}
      />
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-10 rounded-[2.5rem] border border-white/10 bg-white/10 p-8 text-center shadow-[0_40px_120px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-12">
        <div className="space-y-6">
          <div className="relative h-24">
            <span className={`absolute inset-0 flex items-center justify-center text-5xl font-black uppercase tracking-[0.35em] transition-all duration-700 ${stage === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {strings.splash.welcome}
            </span>
            <span className={`absolute inset-0 flex items-center justify-center text-5xl font-black uppercase tracking-[0.35em] transition-all duration-700 ${stage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {strings.splash.namaste}
            </span>
          </div>

          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            {strings.splash.subtitle}
          </p>
        </div>

        <div className={`relative flex h-72 w-72 items-center justify-center overflow-hidden rounded-4xl border border-white/15 bg-slate-950/85 p-6 shadow-2xl transition-all duration-700 ${stage === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <img src={namaste} alt={strings.splash.imageAlt} className="h-full w-full rounded-4xl object-cover" />
        </div>
      </div>
    </div>
  )
}

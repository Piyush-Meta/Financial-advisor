import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'

export default function Login() {
  const { strings } = useLanguage()
  const [form, setForm] = useState({ email: '', password: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

  useEffect(() => {
    const token = localStorage.getItem('sakhi-token')
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.email || !form.password) {
      setStatus('Please enter both email and password.')
      return
    }

    setLoading(true)
    setStatus('Signing in...')

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to sign in.')
      }

      localStorage.setItem('sakhi-token', data.token)
      localStorage.setItem('sakhi-user', JSON.stringify(data.user))
      setStatus(strings.login.successMessage)
      navigate('/dashboard')
    } catch (error) {
      setStatus(error.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-4xl bg-white/95 p-8 shadow-2xl ring-1 ring-white/60 backdrop-blur-xl sm:p-12">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at top left, rgba(139, 92, 246, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.18), transparent 30%)',
          }}
        />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-violet-50 px-4 py-1 text-sm font-semibold text-violet-700">
              {strings.login.welcomeBadge}
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {strings.login.title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              {strings.login.subtitle}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-violet-50 p-6">
                <p className="text-sm font-semibold text-violet-700">{strings.login.feature1.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{strings.login.feature1.description}</p>
              </div>
              <div className="rounded-3xl bg-sky-50 p-6">
                <p className="text-sm font-semibold text-sky-700">{strings.login.feature2.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{strings.login.feature2.description}</p>
              </div>
            </div>
          </div>

          <div className="rounded-4xl bg-white p-8 shadow-2xl ring-1 ring-fuchsia-100 text-slate-900 sm:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold">{strings.login.signIn}</h2>
              <p className="mt-3 text-sm text-slate-500">{strings.login.signInDesc}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-slate-700">
                {strings.login.email}
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  placeholder="name@example.com"
                  className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300/40"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {strings.login.password}
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  placeholder="********"
                  className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300/40"
                  required
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-fuchsia-500"
              >
                {strings.login.loginButton}
              </button>
            </form>
            {status && (
              <div className="mt-6 rounded-3xl bg-fuchsia-50 px-4 py-4 text-sm text-fuchsia-700">
                {status}
              </div>
            )}
            <p className="mt-8 text-sm text-slate-500">{strings.login.forgotText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

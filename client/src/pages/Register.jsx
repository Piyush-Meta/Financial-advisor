import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import { registerUser } from '../api/ap.js'

export default function Register() {
  const { strings } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('sakhi-token')
    if (token) navigate('/dashboard')
  }, [navigate])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.email || !form.password) {
      setStatus('Please enter your email and password.')
      return
    }

    setLoading(true)
    setStatus('Creating account...')

    try {
      const response = await registerUser(form)
      const data = response.data

      localStorage.setItem('sakhi-token', data.token)
      localStorage.setItem('sakhi-user', JSON.stringify(data.user))
      setStatus(strings.register.successMessage)
      navigate('/dashboard')
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message || 'Unable to register.'
      setStatus(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-4xl bg-white/95 p-8 shadow-2xl ring-1 ring-fuchsia-100 backdrop-blur-xl sm:p-12">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at top left, rgba(236, 72, 153, 0.16), transparent 35%), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.16), transparent 35%)',
          }}
        />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-fuchsia-50 px-4 py-1 text-sm font-semibold text-fuchsia-700">
              {strings.register.banner}
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {strings.register.title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              {strings.register.subtitle}
            </p>
          </div>

          <div className="rounded-4xl bg-slate-50 p-8 shadow-xl ring-1 ring-fuchsia-100 text-slate-900 sm:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold">{strings.register.heading}</h2>
              <p className="mt-3 text-sm text-slate-500">{strings.register.description}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-slate-700">
                {strings.register.name}
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Your name"
                  className="mt-3 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-300/40"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                {strings.register.email}
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
                {strings.register.password}
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
                disabled={loading}
                className="w-full rounded-full bg-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {strings.register.registerButton}
              </button>
            </form>
            {status && (
              <div className="mt-6 rounded-3xl bg-fuchsia-50 px-4 py-4 text-sm text-fuchsia-700">
                {status}
              </div>
            )}
            <p className="mt-8 text-sm text-slate-500">
              {strings.register.alreadyText}{' '}
              <Link to="/login" className="font-semibold text-fuchsia-600 hover:text-fuchsia-500">
                {strings.register.loginLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

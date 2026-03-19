import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dotnetApi from '../api/dotnet'
import { useAuth } from '../context/AuthContext'

const perks = [
  'Unlimited health record logging',
  'AI anomaly detection on all vitals',
  '7-day predictive weight forecasting',
  '30-day trend analysis & summaries',
]

const inputCls =
  'w-full h-12 border border-border rounded-xl px-4 text-sm bg-transparent text-foreground ' +
  'placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent ' +
  'focus:ring-offset-2 focus:ring-offset-background transition-shadow'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await dotnetApi.post('/api/auth/register', form)
      login(data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        type={type}
        required
        placeholder={placeholder}
        className={inputCls}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  )

  return (
    <div className="min-h-screen flex">

      {/* ── Brand panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-foreground relative overflow-hidden flex-col justify-between p-14">
        {/* Texture + glows */}
        <div className="absolute inset-0 dot-pattern pointer-events-none" />
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full bg-accent/10 blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent-secondary/[0.08] blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <h1 className="font-display text-3xl gradient-text tracking-tight">DataPulse</h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/40 mt-1">
            Health Intelligence Platform
          </p>
        </div>

        {/* Headline + perks */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-display text-[2.75rem] leading-[1.1] text-white">
              Start your{' '}
              <span className="gradient-text">wellness journey</span>{' '}
              today.
            </h2>
            <p className="text-white/55 mt-4 leading-relaxed">
              Join DataPulse and gain AI-powered insights into your health patterns from day one.
            </p>
          </div>

          {/* Perks card */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/35 mb-4">
              Everything included
            </p>
            <ul className="space-y-3">
              {perks.map(p => (
                <li key={p} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full gradient-bg flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="relative z-10 font-mono text-[11px] text-white/25">
          © {new Date().getFullYear()} DataPulse
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-[400px] animate-fade-in-up">

          {/* Section badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 mb-7">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">Create Account</span>
          </div>

          <h1 className="font-display text-4xl text-foreground tracking-tight mb-2">Get started</h1>
          <p className="text-muted-foreground text-[15px] mb-8">Create your free account in seconds.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {field('Full Name', 'name',     'text',     'Jane Doe')}
            {field('Email',     'email',    'email',    'you@example.com')}
            {field('Password',  'password', 'password', '••••••••')}
            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 gradient-bg text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-accent hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating account…' : (
                <>
                  Create Account
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

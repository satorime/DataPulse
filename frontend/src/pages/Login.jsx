import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import dotnetApi from '../api/dotnet'
import { useAuth } from '../context/AuthContext'

const features = [
  { emoji: '⚡', label: 'Real-time health tracking & monitoring' },
  { emoji: '🧠', label: 'AI-powered anomaly detection' },
  { emoji: '📈', label: '7-day predictive weight forecasting' },
]

const inputCls =
  'w-full h-12 border border-border rounded-xl px-4 text-sm bg-transparent text-foreground ' +
  'placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent ' +
  'focus:ring-offset-2 focus:ring-offset-background transition-shadow'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await dotnetApi.post('/api/auth/login', form)
      login(data)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

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

        {/* Headline + features */}
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="font-display text-[2.75rem] leading-[1.1] text-white">
              Your health data,{' '}
              <span className="gradient-text">intelligently analyzed.</span>
            </h2>
            <p className="text-white/55 mt-4 leading-relaxed">
              Track vitals, discover patterns, and receive AI-powered insights to guide your wellness journey.
            </p>
          </div>
          <div className="space-y-3.5">
            {features.map(f => (
              <div key={f.label} className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-base flex-shrink-0 shadow-accent">
                  {f.emoji}
                </div>
                <span className="text-white/75 text-sm">{f.label}</span>
              </div>
            ))}
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
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">Sign In</span>
          </div>

          <h1 className="font-display text-4xl text-foreground tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-[15px] mb-8">Sign in to your account to continue.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className={inputCls}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className={inputCls}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group w-full h-12 gradient-bg text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-accent hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in…' : (
                <>
                  Sign In
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
            No account?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

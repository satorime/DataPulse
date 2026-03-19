import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import djangoApi from '../api/django'
import dotnetApi from '../api/dotnet'
import HealthForm from '../components/HealthForm'
import StatsCard from '../components/StatsCard'
import WeightChart from '../components/WeightChart'
import { useAuth } from '../context/AuthContext'

/* ── Reusable section badge ─────────────────────────────────────── */
function SectionBadge({ label, light = false }) {
  return (
    <div className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 mb-4 ${
      light
        ? 'border-white/20 bg-white/[0.05]'
        : 'border-accent/30 bg-accent/5'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full animate-pulse-dot flex-shrink-0 ${
        light ? 'bg-accent-secondary' : 'bg-accent'
      }`} />
      <span className={`font-mono text-[11px] uppercase tracking-[0.15em] ${
        light ? 'text-white/60' : 'text-accent'
      }`}>
        {label}
      </span>
    </div>
  )
}

/* ── Section heading ─────────────────────────────────────────────── */
function SectionHeading({ children, light = false }) {
  return (
    <h2 className={`font-display text-2xl tracking-tight ${light ? 'text-white' : 'text-foreground'}`}>
      {children}
    </h2>
  )
}

/* ── Skeleton row for loading state ─────────────────────────────── */
function SkeletonRow({ light = false }) {
  return (
    <div className={`h-5 rounded-lg animate-pulse ${light ? 'bg-white/10' : 'bg-muted'}`} />
  )
}

/* ═══════════════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [predictions, setPredictions] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [summary, setSummary] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)

  const fetchRecords = useCallback(async () => {
    try {
      const { data } = await dotnetApi.get('/api/healthrecords')
      setRecords(data)
    } catch {
      // handled silently — user sees empty state
    }
  }, [])

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true)
    try {
      const [predRes, anomalyRes, summaryRes] = await Promise.all([
        djangoApi.get('/api/analytics/predict/weight/'),
        djangoApi.get('/api/analytics/anomalies/'),
        djangoApi.get('/api/analytics/summary/'),
      ])
      setPredictions(predRes.data.predictions ?? [])
      setAnomalies(anomalyRes.data.anomalies ?? [])
      setSummary(summaryRes.data ?? {})
    } catch {
      // insights are optional; fail silently
    } finally {
      setLoadingInsights(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
    fetchInsights()
  }, [fetchRecords, fetchInsights])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const latest = records[0] ?? {}

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-card/90 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl gradient-text tracking-tight leading-none">DataPulse</h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
              Health Intelligence
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-semibold shadow-accent flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* ── 1. Latest stats ──────────────────────────────────────── */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <SectionBadge label="Latest Readings" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard label="Weight"     value={latest.weight}                    unit="kg"  icon="weight"    />
            <StatsCard label="Steps"      value={latest.steps?.toLocaleString()}   unit=""    icon="steps"     />
            <StatsCard label="Sleep"      value={latest.sleepHours}                unit="hrs" icon="sleep"     />
            <StatsCard label="Heart Rate" value={latest.heartRate}                 unit="bpm" icon="heartRate" />
          </div>
        </section>

        {/* ── 2. Weight trend chart ────────────────────────────────── */}
        <section
          className="bg-card rounded-2xl border border-border shadow-md overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <SectionBadge label="Weight Trend" />
            <SectionHeading>Progress Over Time</SectionHeading>
          </div>
          <div className="px-2 pb-2">
            <WeightChart records={records} predictions={predictions} />
          </div>
        </section>

        {/* ── 3. AI Insights — inverted section ───────────────────── */}
        <section
          className="relative bg-foreground rounded-2xl overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          {/* Texture + ambient glow */}
          <div className="absolute inset-0 dot-pattern pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-accent/[0.12] blur-[80px] pointer-events-none" />

          <div className="relative z-10 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <SectionBadge label="AI Insights" light />
                <SectionHeading light>Health Intelligence</SectionHeading>
              </div>
              <button
                onClick={fetchInsights}
                disabled={loadingInsights}
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/35 hover:text-white/70 transition-colors disabled:opacity-30 mt-1 flex-shrink-0"
              >
                {loadingInsights ? 'Refreshing…' : '↺ Refresh'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* 30-day summary */}
              <div className="bg-white/[0.04] rounded-xl border border-white/10 p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/35 mb-4">
                  30-Day Summary
                </p>
                {loadingInsights ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3, 4].map(i => (
                      <SkeletonRow key={i} light />
                    ))}
                  </div>
                ) : Object.keys(summary).length === 0 ? (
                  <p className="text-sm text-white/30">No data yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {Object.entries(summary).map(([key, stat]) => (
                      <div key={key} className="flex justify-between items-baseline text-sm">
                        <span className="text-white/55 capitalize">{key.replace('_', ' ')}</span>
                        <span className="font-medium text-white/90">
                          avg {stat.avg} {stat.unit}
                          <span className="text-white/35 font-normal text-xs ml-1.5">
                            ({stat.min}–{stat.max})
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Anomaly alerts */}
              <div className="bg-white/[0.04] rounded-xl border border-white/10 p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/35 mb-4">
                  Anomaly Alerts
                </p>
                {loadingInsights ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3].map(i => (
                      <SkeletonRow key={i} light />
                    ))}
                  </div>
                ) : anomalies.length === 0 ? (
                  <div className="flex items-center gap-2.5 text-sm text-white/35">
                    <span className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-xs text-white/50">
                      ✓
                    </span>
                    No anomalies detected.
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {anomalies.map((a, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          a.severity === 'high' ? 'bg-red-400' : 'bg-yellow-400'
                        }`} />
                        <span>
                          <span className="font-medium text-white/90">{a.type}</span>{' '}
                          <span className="text-white/55">{a.value}</span>{' '}
                          <span className="text-white/30 text-xs">on {a.date}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Log new entry ─────────────────────────────────────── */}
        <section
          className="bg-card rounded-2xl border border-border shadow-md overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <button
            onClick={() => setShowForm(v => !v)}
            className="group w-full px-6 py-5 flex items-center justify-between hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-accent flex-shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5"  y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">Log New Health Entry</p>
                <p className="font-mono text-[11px] text-muted-foreground tracking-wide mt-0.5">
                  Record your vitals for today
                </p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${showForm ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showForm && (
            <div className="px-6 pb-6 pt-2 border-t border-border">
              <HealthForm
                onSaved={() => {
                  fetchRecords()
                  fetchInsights()
                  setShowForm(false)
                }}
              />
            </div>
          )}
        </section>

        {/* ── 5. Recent records table ──────────────────────────────── */}
        <section
          className="bg-card rounded-2xl border border-border shadow-md overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.25s' }}
        >
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <SectionBadge label="Recent Records" />
            <SectionHeading>Health Log</SectionHeading>
          </div>

          {records.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground text-sm">
                No records yet — log your first entry above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Date', 'Weight', 'BP', 'Steps', 'Sleep', 'HR', 'Notes'].map(h => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-normal whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 10).map((r, idx) => (
                    <tr
                      key={r.id}
                      className={`border-b border-border/50 hover:bg-muted/40 transition-colors ${
                        idx === 0 ? 'bg-accent/[0.02]' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5 font-medium text-foreground whitespace-nowrap">
                        {r.date?.slice(0, 10)}
                      </td>
                      <td className="px-6 py-3.5 text-foreground">
                        {r.weight ?? <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-foreground whitespace-nowrap">
                        {r.systolicBp && r.diastolicBp
                          ? `${r.systolicBp}/${r.diastolicBp}`
                          : <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-foreground">
                        {r.steps?.toLocaleString() ?? <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-foreground">
                        {r.sleepHours ?? <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-foreground">
                        {r.heartRate ?? <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground max-w-[200px] truncate">
                        {r.notes ?? ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}

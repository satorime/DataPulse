import { useCallback, useEffect, useState } from 'react'
import djangoApi from '../api/django'
import dotnetApi from '../api/dotnet'
import HealthForm from '../components/HealthForm'
import StatsCard from '../components/StatsCard'
import WeightChart from '../components/WeightChart'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">DataPulse</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Stats row */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Latest Readings
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard label="Weight" value={latest.weight} unit="kg" color="blue" />
            <StatsCard label="Steps" value={latest.steps?.toLocaleString()} unit="" color="green" />
            <StatsCard label="Sleep" value={latest.sleepHours} unit="hrs" color="purple" />
            <StatsCard label="Heart Rate" value={latest.heartRate} unit="bpm" color="orange" />
          </div>
        </section>

        {/* Chart */}
        <section className="bg-white rounded-xl shadow-sm p-4">
          <WeightChart records={records} predictions={predictions} />
        </section>

        {/* AI Insights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* 30-day summary */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">30-Day Summary</h2>
              <button
                onClick={fetchInsights}
                disabled={loadingInsights}
                className="text-xs text-blue-600 hover:underline disabled:opacity-40"
              >
                {loadingInsights ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
            {Object.keys(summary).length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(summary).map(([key, stat]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                    <span className="font-medium text-gray-800">
                      avg {stat.avg} {stat.unit} &nbsp;
                      <span className="text-gray-400 font-normal">
                        ({stat.min}–{stat.max})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Anomalies */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Anomaly Alerts</h2>
            {anomalies.length === 0 ? (
              <p className="text-sm text-gray-400">No anomalies detected.</p>
            ) : (
              <ul className="space-y-2">
                {anomalies.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        a.severity === 'high' ? 'bg-red-500' : 'bg-yellow-400'
                      }`}
                    />
                    <span>
                      <span className="font-medium text-gray-800">{a.type}</span>{' '}
                      <span className="text-gray-500">{a.value}</span>{' '}
                      <span className="text-gray-400">on {a.date}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Log new entry */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 font-semibold text-gray-800 w-full text-left"
          >
            <span>{showForm ? '▾' : '▸'}</span>
            Log New Health Entry
          </button>
          {showForm && (
            <div className="mt-4">
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

        {/* Recent records table */}
        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Records</h2>
          {records.length === 0 ? (
            <p className="text-sm text-gray-400">No records yet. Log your first entry above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-500 border-b">
                    {['Date', 'Weight', 'BP', 'Steps', 'Sleep', 'HR', 'Notes'].map(h => (
                      <th key={h} className="pb-2 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 10).map(r => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 pr-4">{r.date?.slice(0, 10)}</td>
                      <td className="py-2 pr-4">{r.weight ?? '—'}</td>
                      <td className="py-2 pr-4">
                        {r.systolicBp && r.diastolicBp
                          ? `${r.systolicBp}/${r.diastolicBp}`
                          : '—'}
                      </td>
                      <td className="py-2 pr-4">{r.steps?.toLocaleString() ?? '—'}</td>
                      <td className="py-2 pr-4">{r.sleepHours ?? '—'}</td>
                      <td className="py-2 pr-4">{r.heartRate ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-400 max-w-xs truncate">{r.notes ?? ''}</td>
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

import { useState } from 'react'
import dotnetApi from '../api/dotnet'

const today = () => new Date().toISOString().slice(0, 10)

const inputCls =
  'w-full h-11 border border-border rounded-xl px-4 text-sm bg-transparent text-foreground ' +
  'placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent ' +
  'focus:ring-offset-2 focus:ring-offset-background transition-shadow'

export default function HealthForm({ onSaved }) {
  const [form, setForm] = useState({
    weight: '', systolicBp: '', diastolicBp: '',
    steps: '', sleepHours: '', heartRate: '',
    notes: '', date: today(),
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await dotnetApi.post('/api/healthrecords', {
        weight:      form.weight      ? parseFloat(form.weight)      : null,
        systolicBp:  form.systolicBp  ? parseInt(form.systolicBp)    : null,
        diastolicBp: form.diastolicBp ? parseInt(form.diastolicBp)   : null,
        steps:       form.steps       ? parseInt(form.steps)         : null,
        sleepHours:  form.sleepHours  ? parseFloat(form.sleepHours)  : null,
        heartRate:   form.heartRate   ? parseInt(form.heartRate)      : null,
        notes:       form.notes || null,
        date:        new Date(form.date).toISOString(),
      })
      setSuccess(true)
      setForm(f => ({ ...f, notes: '', date: today() }))
      onSaved?.()
    } catch {
      setError('Failed to save record.')
    } finally {
      setSaving(false)
    }
  }

  const numField = (label, key, placeholder) => (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
        {label}
      </label>
      <input
        type="number"
        step="any"
        placeholder={placeholder}
        value={form[key]}
        onChange={set(key)}
        className={inputCls}
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3.5 rounded-xl">
          Entry saved successfully.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3.5 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {numField('Weight (kg)',       'weight',      '70.5')}
        {numField('Systolic BP',       'systolicBp',  '120')}
        {numField('Diastolic BP',      'diastolicBp', '80')}
        {numField('Steps',             'steps',       '8000')}
        {numField('Sleep (hrs)',        'sleepHours',  '7.5')}
        {numField('Heart Rate (bpm)',   'heartRate',   '72')}
      </div>

      <div className="flex gap-4 flex-wrap items-start">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={set('date')}
            className="h-11 border border-border rounded-xl px-4 text-sm bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-shadow"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
            Notes
          </label>
          <textarea
            rows={1}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Optional notes…"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-shadow resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="group h-11 gradient-bg text-white px-6 rounded-xl text-sm font-medium shadow-sm hover:shadow-accent hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? 'Saving…' : (
          <>
            Log Entry
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
  )
}

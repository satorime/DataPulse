import { useState } from 'react'
import dotnetApi from '../api/dotnet'

const today = () => new Date().toISOString().slice(0, 10)

export default function HealthForm({ onSaved }) {
  const [form, setForm] = useState({
    weight: '',
    systolicBp: '',
    diastolicBp: '',
    steps: '',
    sleepHours: '',
    heartRate: '',
    notes: '',
    date: today(),
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
      const payload = {
        weight: form.weight ? parseFloat(form.weight) : null,
        systolicBp: form.systolicBp ? parseInt(form.systolicBp) : null,
        diastolicBp: form.diastolicBp ? parseInt(form.diastolicBp) : null,
        steps: form.steps ? parseInt(form.steps) : null,
        sleepHours: form.sleepHours ? parseFloat(form.sleepHours) : null,
        heartRate: form.heartRate ? parseInt(form.heartRate) : null,
        notes: form.notes || null,
        date: new Date(form.date).toISOString(),
      }
      await dotnetApi.post('/api/healthrecords', payload)
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
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="number"
        step="any"
        placeholder={placeholder}
        value={form[key]}
        onChange={set(key)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded">Record saved!</div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {numField('Weight (kg)', 'weight', '70.5')}
        {numField('Systolic BP', 'systolicBp', '120')}
        {numField('Diastolic BP', 'diastolicBp', '80')}
        {numField('Steps', 'steps', '8000')}
        {numField('Sleep (hrs)', 'sleepHours', '7.5')}
        {numField('Heart Rate (bpm)', 'heartRate', '72')}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={set('date')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={set('notes')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Log Entry'}
      </button>
    </form>
  )
}

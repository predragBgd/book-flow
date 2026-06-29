import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import { DAY_NAMES } from '../../utils/helpers'

export default function AdminSettings() {
  const [hours, setHours] = useState([])
  const [blockedDates, setBlockedDates] = useState([])
  const [buffer, setBuffer] = useState(10)
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = () => {
    Promise.all([api.getHours(), api.getBlockedDates(), api.getAppSettings()])
      .then(([hoursRes, blockedRes, settingsRes]) => {
        setHours(hoursRes.data)
        setBlockedDates(blockedRes.data)
        setBuffer(settingsRes.data.slot_buffer_minutes)
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const updateHour = (dayOfWeek, field, value) => {
    setHours((prev) =>
      prev.map((h) =>
        h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h
      )
    )
  }

  const saveHours = async () => {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { data } = await api.updateHours(hours)
      setHours(data)
      await api.updateAppSettings({ slot_buffer_minutes: buffer })
      setMessage('Settings saved.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const addBlocked = async (e) => {
    e.preventDefault()
    if (!newDate) return
    setError('')
    try {
      await api.addBlockedDate({ date: newDate, reason: newReason || undefined })
      setNewDate('')
      setNewReason('')
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const removeBlocked = async (id) => {
    try {
      await api.deleteBlockedDate(id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Business hours control available booking slots</p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Business hours</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="pb-2 pr-4">Day</th>
                <th className="pb-2 pr-4">Open</th>
                <th className="pb-2 pr-4">From</th>
                <th className="pb-2">To</th>
              </tr>
            </thead>
            <tbody>
              {hours.map((h) => (
                <tr key={h.day_of_week} className="border-t border-slate-100">
                  <td className="py-2 pr-4 font-medium">{DAY_NAMES[h.day_of_week]}</td>
                  <td className="py-2 pr-4">
                    <input
                      type="checkbox"
                      checked={h.is_open}
                      onChange={(e) =>
                        updateHour(h.day_of_week, 'is_open', e.target.checked)
                      }
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      type="time"
                      value={h.open_time || '09:00'}
                      disabled={!h.is_open}
                      onChange={(e) =>
                        updateHour(h.day_of_week, 'open_time', e.target.value)
                      }
                      className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="time"
                      value={h.close_time || '17:00'}
                      disabled={!h.is_open}
                      onChange={(e) =>
                        updateHour(h.day_of_week, 'close_time', e.target.value)
                      }
                      className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <label className="mt-4 block text-sm">
          Buffer between appointments (minutes)
          <input
            type="number"
            min="0"
            value={buffer}
            onChange={(e) => setBuffer(Number(e.target.value))}
            className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <button
          onClick={saveHours}
          disabled={saving}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save hours'}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Blocked dates</h2>
        <form onSubmit={addBlocked} className="mt-4 flex flex-wrap gap-3">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
            required
          />
          <input
            placeholder="Reason (optional)"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Add date
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {blockedDates.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span>
                {d.date} {d.reason && `— ${d.reason}`}
              </span>
              <button
                onClick={() => removeBlocked(d.id)}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
          {blockedDates.length === 0 && (
            <li className="text-sm text-slate-500">No blocked dates.</li>
          )}
        </ul>
      </div>
    </div>
  )
}

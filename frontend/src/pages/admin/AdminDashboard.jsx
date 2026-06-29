import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .adminStats()
      .then(({ data }) => setStats(data))
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  if (error) return <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
  if (!stats) return <LoadingSpinner />

  const maxCount = Math.max(...stats.weekly_bookings.map((d) => d.count), 1)

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pending requests</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{stats.pending_count}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Today&apos;s appointments</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{stats.today_count}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Average rating</p>
          <p className="mt-1 text-3xl font-bold text-violet-600">
            {stats.avg_rating ?? '—'}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold">Bookings this week</h2>
        <div className="mt-4 flex h-40 items-end gap-2">
          {stats.weekly_bookings.map((day) => (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-indigo-500"
                style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count ? 8 : 2 }}
              />
              <span className="text-xs text-slate-500">
                {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {stats.pending_count > 0 && (
        <Link
          to="/admin/bookings?status=pending"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          View {stats.pending_count} pending booking(s) →
        </Link>
      )}
    </div>
  )
}

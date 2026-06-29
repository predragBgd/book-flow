import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDateTime } from '../../utils/helpers'

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .adminClients()
      .then(({ data }) => setClients(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold">Clients (CRM)</h1>
      <p className="mt-1 text-sm text-slate-500">Aggregated from booking history</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Visits</th>
              <th className="px-4 py-3">Last visit</th>
              <th className="px-4 py-3">Avg rating</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.client_email} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">{c.client_name}</td>
                <td className="px-4 py-3">{c.client_email}</td>
                <td className="px-4 py-3">{c.booking_count}</td>
                <td className="px-4 py-3">{formatDateTime(c.last_visit)}</td>
                <td className="px-4 py-3">{c.avg_rating ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="px-4 py-8 text-center text-slate-500">No clients yet.</p>
        )}
      </div>
    </div>
  )
}

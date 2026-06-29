import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDateTime } from '../../utils/helpers'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .adminReviews()
      .then(({ data }) => setReviews(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews</h1>

      <div className="mt-6 space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{r.client_name}</p>
              <span className="text-amber-500">{'★'.repeat(r.rating)}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {r.service_name} · {r.staff_name} · {formatDateTime(r.created_at)}
            </p>
            {r.comment && <p className="mt-2 text-sm text-slate-700">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-slate-500">No reviews yet.</p>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, getErrorMessage } from '../api/client'
import PublicLayout from '../components/PublicLayout'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDateTime } from '../utils/helpers'

export default function BookingTokenPage() {
  const { token } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadBooking = () => {
    setLoading(true)
    api
      .getBookingByToken(token)
      .then(({ data }) => setBooking(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBooking()
  }, [token])

  const handleReview = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const { data } = await api.submitReview(token, { rating, comment })
      setBooking(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <LoadingSpinner />
      </PublicLayout>
    )
  }

  if (error && !booking) {
    return (
      <PublicLayout>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold">Your booking</h1>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{booking.service?.name}</h2>
            <StatusBadge status={booking.status} />
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">When</dt>
              <dd>{formatDateTime(booking.scheduled_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Client</dt>
              <dd>{booking.client_name}</dd>
            </div>
            {booking.staff && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Assigned to</dt>
                <dd>{booking.staff.name}</dd>
              </div>
            )}
          </dl>

          {booking.status === 'pending' && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Waiting for admin to assign staff and confirm your appointment.
            </p>
          )}

          {booking.status === 'confirmed' && (
            <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
              Your appointment is confirmed. See you soon!
            </p>
          )}

          {booking.status === 'completed' && !booking.review && (
            <form onSubmit={handleReview} className="mt-6 border-t border-slate-100 pt-6">
              <h3 className="font-semibold">Rate your experience</h3>
              {error && (
                <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`rounded-lg px-3 py-2 text-lg ${
                      rating >= n ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional comment..."
                rows={3}
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          )}

          {booking.review && (
            <div className="mt-4 rounded-lg bg-violet-50 px-3 py-3 text-sm">
              <p className="font-medium text-violet-900">
                Your rating: {'★'.repeat(booking.review.rating)}
              </p>
              {booking.review.comment && (
                <p className="mt-1 text-violet-800">{booking.review.comment}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

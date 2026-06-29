import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDateTime } from "../../utils/helpers";

export default function StaffBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingId, setCompletingId] = useState(null);

  const load = () => {
    api
      .staffBookings()
      .then(({ data }) => setBookings(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleComplete = async (id) => {
    setCompletingId(id);
    setError("");
    try {
      await api.completeBooking(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold">My bookings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Mark confirmed appointments as completed
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{b.service?.name}</p>
                <p className="mt-1 text-sm text-slate-600">{b.client_name}</p>
                <p className="text-sm text-slate-500">
                  {formatDateTime(b.scheduled_at)}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </div>
            {b.status === "confirmed" && (
              <button
                onClick={() => handleComplete(b.id)}
                disabled={completingId === b.id}
                className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {completingId === b.id ? "Saving..." : "Mark as completed"}
              </button>
            )}
          </div>
        ))}
        {bookings.length === 0 && (
          <p className="text-center text-slate-500">No assigned bookings.</p>
        )}
      </div>
    </div>
  );
}

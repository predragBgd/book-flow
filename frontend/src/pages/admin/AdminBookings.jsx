import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, getErrorMessage } from "../../api/client";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import { formatDateTime } from "../../utils/helpers";

export default function AdminBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";

  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [staffId, setStaffId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.adminBookings(statusFilter || undefined),
      api.adminStaff(),
    ])
      .then(([bookingsRes, staffRes]) => {
        setBookings(bookingsRes.data);
        setStaff(staffRes.data.filter((s) => s.is_active));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleConfirm = async () => {
    if (!staffId) return;
    setActionLoading(true);
    try {
      await api.confirmBooking(confirmId, { staff_id: Number(staffId) });
      setConfirmId(null);
      setStaffId("");
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    setActionLoading(true);
    try {
      await api.cancelBooking(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.exportCsv();
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "bookings.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <button
          onClick={handleExport}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["", "pending", "confirmed", "completed", "reviewed", "cancelled"].map(
          (s) => (
            <button
              key={s || "all"}
              onClick={() => setSearchParams(s ? { status: s } : {})}
              className={`rounded-full px-3 py-1 text-sm ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {s || "All"}
            </button>
          ),
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.client_name}</div>
                    <div className="text-slate-500">{b.client_email}</div>
                  </td>
                  <td className="px-4 py-3">{b.service?.name}</td>
                  <td className="px-4 py-3">
                    {formatDateTime(b.scheduled_at)}
                  </td>
                  <td className="px-4 py-3">{b.staff?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.status === "pending" && (
                        <button
                          onClick={() => {
                            setConfirmId(b.id);
                            setStaffId(staff[0] ? String(staff[0].id) : "");
                          }}
                          className="text-indigo-600 hover:underline"
                        >
                          Confirm
                        </button>
                      )}
                      {["pending", "confirmed"].includes(b.status) && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="text-red-600 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                      <a
                        href={`/booking/${b.access_token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:underline"
                      >
                        Link
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <p className="px-4 py-8 text-center text-slate-500">
              No bookings found.
            </p>
          )}
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Confirm booking</h3>
            <p className="mt-2 text-sm text-slate-600">
              Assign a staff member and confirm.
            </p>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handleConfirm}
                disabled={actionLoading || !staffId}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

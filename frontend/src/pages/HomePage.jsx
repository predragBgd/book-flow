import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import PublicLayout from "../components/PublicLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import { addDays, todayString } from "../utils/helpers";

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayString());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const loadServices = () => {
    setLoading(true);
    setError("");
    return api
      .getServices()
      .then(({ data }) => {
        setServices(data);
        if (data.length) setServiceId(String(data[0].id));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (!serviceId || !date) return;

    setSlotsLoading(true);
    setSelectedTime("");
    api
      .getSlots(serviceId, date)
      .then(({ data }) => setSlots(data.slots || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setSlotsLoading(false));
  }, [serviceId, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await api.createBooking({
        service_id: Number(serviceId),
        date,
        time: selectedTime,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || undefined,
      });
      setSuccess(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <LoadingSpinner label="Loading services… First visit may take up to 60s while the server wakes up." />
      </PublicLayout>
    );
  }

  if (error && services.length === 0) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-lg font-semibold text-red-900">Could not load services</h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadServices}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Try again
          </button>
        </div>
      </PublicLayout>
    );
  }

  if (success) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="text-4xl">✓</div>
          <h2 className="mt-4 text-2xl font-semibold text-emerald-900">
            Request sent
          </h2>
          <p className="mt-2 text-emerald-800">
            Your booking request has been submitted. An admin will assign staff
            and confirm your appointment.
          </p>
          <Link
            to={`/booking/${success.access_token}`}
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            View booking status
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Book your appointment
          </h1>
          <p className="mt-3 text-slate-600">
            Smart booking for service businesses. Choose a service and available
            time — no account required.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li>• Pick a service and time slot</li>
            <li>• Admin confirms and assigns staff</li>
            <li>• Leave a review after your visit</li>
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold">New booking</h2>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Service
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration_minutes} min
                  {s.price != null ? ` · $${s.price}` : ""})
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Date
            <input
              type="date"
              value={date}
              min={todayString()}
              max={addDays(todayString(), 60)}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </label>

          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">
              Available times
            </p>
            {slotsLoading ? (
              <p className="mt-2 text-sm text-slate-500">Loading slots...</p>
            ) : slots.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                No slots available for this date.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-lg border px-2 py-2 text-sm ${
                      selectedTime === slot
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 hover:border-indigo-400"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Full name
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </label>

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Phone (optional)
            <input
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !selectedTime}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Request appointment"}
          </button>
        </form>
      </div>
    </PublicLayout>
  );
}

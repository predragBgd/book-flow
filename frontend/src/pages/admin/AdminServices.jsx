import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'

const emptyForm = { name: '', duration_minutes: 30, price: '', is_active: true }

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    api
      .adminServices()
      .then(({ data }) => setServices(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      name: form.name,
      duration_minutes: Number(form.duration_minutes),
      price: form.price === '' ? null : Number(form.price),
      is_active: form.is_active,
    }
    try {
      if (editId) {
        await api.updateService(editId, payload)
      } else {
        await api.createService(payload)
      }
      setForm(emptyForm)
      setEditId(null)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (service) => {
    setEditId(service.id)
    setForm({
      name: service.name,
      duration_minutes: service.duration_minutes,
      price: service.price ?? '',
      is_active: service.is_active,
    })
  }

  const deactivate = async (id) => {
    try {
      await api.deleteService(id)
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold">Services</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2"
      >
        <h2 className="sm:col-span-2 font-semibold">
          {editId ? 'Edit service' : 'Add service'}
        </h2>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2"
          required
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price (optional)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Active
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {saving ? 'Saving...' : editId ? 'Update' : 'Add'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null)
                setForm(emptyForm)
              }}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.duration_minutes} min</td>
                <td className="px-4 py-3">{s.price != null ? `$${s.price}` : '—'}</td>
                <td className="px-4 py-3">{s.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(s)} className="text-indigo-600 hover:underline">
                    Edit
                  </button>
                  {s.is_active && (
                    <button
                      onClick={() => deactivate(s.id)}
                      className="ml-3 text-red-600 hover:underline"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

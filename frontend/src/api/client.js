import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookflow_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const api = {
  // Public
  getServices: () => client.get('/services'),
  getSlots: (serviceId, date) =>
    client.get('/slots', { params: { service_id: serviceId, date } }),
  createBooking: (data) => client.post('/bookings', data),
  getBookingByToken: (token) => client.get(`/bookings/${token}`),
  submitReview: (token, data) => client.post(`/bookings/${token}/review`, data),

  // Auth
  login: (email, password) => client.post('/auth/login', { email, password }),
  me: () => client.get('/auth/me'),

  // Admin
  adminStats: () => client.get('/admin/stats'),
  adminBookings: (status) =>
    client.get('/admin/bookings', { params: status ? { status } : {} }),
  confirmBooking: (id, data) => client.patch(`/admin/bookings/${id}/confirm`, data),
  cancelBooking: (id) => client.patch(`/admin/bookings/${id}/cancel`),
  adminServices: () => client.get('/admin/services'),
  createService: (data) => client.post('/admin/services', data),
  updateService: (id, data) => client.put(`/admin/services/${id}`, data),
  deleteService: (id) => client.delete(`/admin/services/${id}`),
  adminStaff: () => client.get('/admin/staff'),
  createStaff: (data) => client.post('/admin/staff', data),
  updateStaff: (id, data) => client.put(`/admin/staff/${id}`, data),
  deactivateStaff: (id) => client.delete(`/admin/staff/${id}`),
  adminClients: () => client.get('/admin/clients'),
  adminReviews: () => client.get('/admin/reviews'),
  exportCsv: () =>
    client.get('/admin/export.csv', { responseType: 'blob' }),
  getHours: () => client.get('/admin/settings/hours'),
  updateHours: (hours) => client.put('/admin/settings/hours', { hours }),
  getBlockedDates: () => client.get('/admin/settings/blocked-dates'),
  addBlockedDate: (data) => client.post('/admin/settings/blocked-dates', data),
  deleteBlockedDate: (id) => client.delete(`/admin/settings/blocked-dates/${id}`),
  getAppSettings: () => client.get('/admin/settings/app'),
  updateAppSettings: (data) => client.put('/admin/settings/app', data),

  // Staff
  staffBookings: () => client.get('/staff/bookings'),
  completeBooking: (id) => client.patch(`/staff/bookings/${id}/complete`),
}

export function getErrorMessage(error) {
  if (error.code === 'ECONNABORTED') {
    return 'Server is waking up (free hosting). Wait ~60 seconds and try again.'
  }
  if (error.message === 'Network Error') {
    return 'Cannot reach the API. Check VITE_API_URL or start the backend locally.'
  }
  return error.response?.data?.error || error.message || 'Something went wrong'
}

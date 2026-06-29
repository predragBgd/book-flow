import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import BookingTokenPage from './pages/BookingTokenPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBookings from './pages/admin/AdminBookings'
import AdminServices from './pages/admin/AdminServices'
import AdminStaff from './pages/admin/AdminStaff'
import AdminClients from './pages/admin/AdminClients'
import AdminReviews from './pages/admin/AdminReviews'
import AdminSettings from './pages/admin/AdminSettings'
import StaffLayout from './pages/staff/StaffLayout'
import StaffLogin from './pages/staff/StaffLogin'
import StaffBookings from './pages/staff/StaffBookings'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking/:token" element={<BookingTokenPage />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/staff/login" element={<StaffLogin />} />
          <Route
            path="/staff"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffBookings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

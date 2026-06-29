import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to={role === 'staff' ? '/staff/login' : '/admin/login'} replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'staff' ? '/staff' : '/admin'} replace />
  }

  return children
}

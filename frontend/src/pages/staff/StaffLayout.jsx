import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function StaffLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/staff/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-bold text-indigo-600">BookFlow</p>
            <p className="text-xs text-slate-500">Staff panel</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <NavLink
              to="/staff"
              end
              className={({ isActive }) =>
                isActive ? 'font-medium text-indigo-600' : 'text-slate-600'
              }
            >
              My bookings
            </NavLink>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">{user?.name}</span>
            <button onClick={handleLogout} className="text-slate-600 hover:text-indigo-600">
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

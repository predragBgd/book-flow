import { Link } from 'react-router-dom'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            BookFlow
          </Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link to="/admin/login" className="hover:text-indigo-600">
              Admin
            </Link>
            <Link to="/staff/login" className="hover:text-indigo-600">
              Staff
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Powered by BookFlow
      </footer>
    </div>
  )
}

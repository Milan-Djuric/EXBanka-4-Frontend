import { useNavigate, Link } from 'react-router-dom'
import useWindowTitle from '../../hooks/useWindowTitle'
import { useAuth } from '../../context/AuthContext'

export default function DashboardPage() {
  useWindowTitle('Dashboard | AnkaBanka')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs tracking-widest uppercase text-violet-600 dark:text-violet-400 mb-4">
          Employee Portal
        </p>
        <h1 className="font-serif text-4xl font-light text-slate-900 dark:text-white mb-3">
          Welcome, {user.firstName}
        </h1>
        <div className="w-10 h-px bg-violet-500 dark:bg-violet-400 mb-8" />

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm space-y-4 mb-8">
          <Row label="Full Name"  value={user.fullName} />
          <Row label="Email"      value={user.email} />
          <Row label="Username"   value={user.username} />
          <Row label="Position"   value={user.position} />
          <Row label="Department" value={user.department} />
          <Row label="Status"     value={user.active ? 'Active' : 'Inactive'} />
        </div>

        <div className="flex items-center gap-4">
          <Link to="/admin/employees" className="btn-primary">
            Employee List
          </Link>
          <button onClick={handleLogout} className="btn-outline">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs tracking-widest uppercase text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm text-slate-900 dark:text-white font-medium">{value}</span>
    </div>
  )
}

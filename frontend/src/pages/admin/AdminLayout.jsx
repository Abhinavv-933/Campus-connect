import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, Clock, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/axios'

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Pending Events', to: '/admin/pending', icon: Clock, badgeKey: 'pendingEvents' },
  { label: 'All Events', to: '/admin/events', icon: CalendarDays },
  { label: 'Organizers', to: '/admin/organizers', icon: Users },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [stats, setStats] = useState({ pendingEvents: 0 })

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch sidebar stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 font-sans">
      <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#18181b] border-r border-zinc-800 flex flex-col">
        <div className="px-6 py-6 border-b border-zinc-800">
          <h1 className="text-white text-2xl font-bold">Campus Connect</h1>
          <p className="text-xs uppercase tracking-widest text-zinc-500 mt-1">Admin Portal</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(({ label, to, icon: Icon, badgeKey }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`)
            const badgeCount = badgeKey ? stats[badgeKey] : 0

            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#27272a] text-white'
                    : 'text-[#a1a1aa] hover:bg-[#27272a] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
                {badgeCount > 0 && (
                  <span className="ml-auto bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-[#27272a] hover:text-rose-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="ml-[260px] p-10">
        <Outlet />
      </main>
    </div>
  )
}

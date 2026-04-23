import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Bell,
  Calendar,
  ChevronLeft,
  Languages,
  LayoutDashboard,
  LogOut,
  Search,
  User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/organizer/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/organizer/my-events', label: 'My Events', icon: Calendar },
]

export default function OrganizerLayout() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const userName = user?.name || 'Organizer'
  const userInitial = userName.charAt(0).toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <aside
        className={`fixed left-4 top-4 bottom-4 z-30 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col transition-all duration-200 ${collapsed ? 'w-24' : 'w-[280px]'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className={collapsed ? 'hidden' : 'block'}>
            <h1 className="text-2xl font-extrabold text-[#4F46E5]">Campus Connect</h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 mt-1">Organizer Portal</p>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-[#4F46E5]' : 'text-slate-500 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-50"
          >
            <Languages className="w-5 h-5 shrink-0" />
            {!collapsed && <span>English</span>}
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={`${collapsed ? 'ml-32' : 'ml-[312px]'} mr-4 py-4 transition-all duration-200`}>
        <header className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center justify-between gap-4">
          <h2 className="text-sm sm:text-base font-extrabold tracking-widest text-slate-600">ORGANIZER PORTAL</h2>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 min-w-[340px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, clubs, workshops.."
                className="bg-transparent w-full text-sm outline-none text-slate-600 placeholder:text-slate-400"
              />
            </div>
            <button type="button" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full transition-colors"
              >
                <span className="hidden sm:block font-semibold text-slate-700">{userName}</span>
                <span className="w-10 h-10 rounded-full bg-indigo-100 text-[#4F46E5] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  {userInitial}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="font-bold text-slate-900 truncate">{userName}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] text-[10px] font-bold mt-1">
                      ORGANIZER
                    </span>
                  </div>
                  <Link 
                    to="/organizer/profile" 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      logout()
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mt-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import EventCard from '../../components/EventCard'

function buildMonthDays(baseDate) {
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevLastDay = new Date(year, month, 0)

  const startWeekday = firstDay.getDay()
  const days = []

  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    days.push({ day: prevLastDay.getDate() - i, currentMonth: false })
  }

  for (let d = 1; d <= lastDay.getDate(); d += 1) {
    days.push({ day: d, currentMonth: true })
  }

  while (days.length < 42) {
    days.push({ day: days.length - (startWeekday + lastDay.getDate()) + 1, currentMonth: false })
  }

  return days
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [monthCursor, setMonthCursor] = useState(new Date())
  const [stats, setStats] = useState({ myRegistrations: 0, availableEvents: 0, upcomingSoon: 0 })
  const [registeredIds, setRegisteredIds] = useState(new Set())
  const [recommendedEvents, setRecommendedEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, eventsRes, registrationsRes] = await Promise.all([
        api.get('/api/student/stats'),
        api.get('/api/student/events?limit=4'),
        api.get('/api/student/my-registrations')
      ])
      setStats(statsRes.data)
      setRecommendedEvents(eventsRes.data)
      setRegisteredIds(new Set(registrationsRes.data.map(e => e._id)))
      setError(null)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/api/student/events/${eventId}/register`)
      toast.success('Successfully registered!')
      
      // Instant UI update
      setRegisteredIds(prev => {
        const next = new Set(prev)
        next.add(eventId)
        return next
      })
      
      // Update count in stat cards
      setStats(prev => ({ ...prev, myRegistrations: prev.myRegistrations + 1 }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const days = useMemo(() => buildMonthDays(monthCursor), [monthCursor])
  const today = new Date()
  const isCurrentMonth =
    today.getMonth() === monthCursor.getMonth() && today.getFullYear() === monthCursor.getFullYear()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Preparing your personalized dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Unable to load dashboard</h3>
        <p className="text-slate-500 max-w-xs">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-2 bg-indigo-600 text-white rounded-full font-bold">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_220px] gap-4">
      <div className="space-y-4">
        <section className="rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#4338CA] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg shadow-indigo-100">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
               Welcome back, {user?.name || 'Student'}! 👋
            </h3>
            <p className="text-indigo-100 mt-2 font-medium">
              You have <span className="text-white font-bold">{stats.myRegistrations}</span> active registrations. Don&apos;t miss out on upcoming campus activities.
            </p>
          </div>
          <Link
            to="/dashboard/discover"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white hover:text-[#4F46E5] transition-all"
          >
            Discover New Events
          </Link>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            ['MY REGISTRATIONS', stats.myRegistrations, CheckCircle2, 'text-emerald-500'],
            ['AVAILABLE EVENTS', stats.availableEvents, CalendarDays, 'text-[#4F46E5]'],
            ['UPCOMING SOON', stats.upcomingSoon, Clock3, 'text-orange-500'],
          ].map(([title, value, Icon, color]) => (
            <div key={title} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:border-indigo-100 transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{title}</p>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold tracking-widest text-slate-500 flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-indigo-500" />
               RECOMMENDED FOR YOU
            </h4>
            <Link to="/dashboard/discover" className="text-sm font-bold text-[#4F46E5] hover:underline">
              View All
            </Link>
          </div>

          {recommendedEvents.length === 0 ? (
             <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No recommended events right now.</p>
             </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {recommendedEvents.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  isRegistered={registeredIds.has(event._id)}
                  onRegister={() => handleRegister(event._id)}
                  role="student"
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 h-fit">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="mt-3 font-bold text-slate-700 text-sm">Campus Schedule</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Apr 2026 Edition</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest text-slate-400">CALENDAR</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="w-7 h-7 rounded-md hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="w-7 h-7 rounded-md hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="font-bold text-slate-800 mb-3 text-sm">
            {monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          <div className="grid grid-cols-7 text-[10px] font-bold text-slate-300 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
              <span key={d} className="text-center py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-[11px]">
            {days.map(({ day, currentMonth }, idx) => {
              const isToday = isCurrentMonth && currentMonth && day === today.getDate()
              return (
                <span key={`${day}-${idx}`} className="h-7 flex items-center justify-center">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors font-semibold ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                        : currentMonth
                          ? 'text-slate-600 hover:bg-slate-50 cursor-default'
                          : 'text-slate-200'
                    }`}
                  >
                    {day}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

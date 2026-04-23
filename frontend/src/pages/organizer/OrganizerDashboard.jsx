import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  XCircle,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import EventCard from '../../components/EventCard'

export default function OrganizerDashboard() {
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [recentEvents, setRecentEvents] = useState([])
  const [totalRegistrations, setTotalRegistrations] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const response = await api.get('/api/organizer/events')
        const { events, counts: fetchedCounts } = response.data
        
        setCounts(fetchedCounts || { pending: 0, approved: 0, rejected: 0, total: 0 })
        
        // Calculate total registrations from ALL events
        const totalReg = events.reduce((acc, ev) => acc + (ev.registrationCount || 0), 0)
        setTotalRegistrations(totalReg)

        // Sort by createdAt desc and take first 5 for the recent list
        const sorted = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setRecentEvents(sorted.slice(0, 5))
        setError(null)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        const msg = err.response?.data?.message || 'Failed to load dashboard data'
        setError(msg)
        toast.error(msg)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Something went wrong</h3>
          <p className="text-slate-500 mt-1 max-w-xs">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-full bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA]"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="pt-6 pb-8 px-8 space-y-6">
      <section className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            ['Pending Approval', counts.pending, Clock3, 'text-orange-500'],
            ['Approved Events', counts.approved, CheckCircle2, 'text-emerald-500'],
            ['Rejected Events', counts.rejected, XCircle, 'text-red-500'],
            ['Total Submissions', counts.total, CalendarDays, 'text-[#4F46E5]'],
          ].map(([title, value, Icon, color]) => (
            <div key={title} className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{title}</p>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
        
        {/* Total Registrations Highlight Card */}
        <div className="mt-4 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-indigo-100">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                 <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                 <p className="text-indigo-100 font-bold text-sm tracking-widest uppercase">Total Registrations Across All Events</p>
                 <p className="text-xs text-indigo-200 mt-0.5 font-medium">students have registered for your events</p>
              </div>
           </div>
           <p className="text-5xl font-black">{totalRegistrations}</p>
        </div>
      </section>

      <section className="w-full rounded-2xl bg-indigo-50 border border-indigo-100 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-indigo-900">Ready to host something amazing?</h3>
          <p className="text-indigo-600 mt-1 font-medium">Create and submit your event for approval instantly.</p>
        </div>
        <Link
          to="/organizer/create-event"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4F46E5] text-white font-bold hover:bg-[#4338CA] shadow-md shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </Link>
      </section>

      <section className="flex flex-col xl:flex-row gap-6">
        <div className="flex-[3] bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-800">Recent Submissions</h4>
            <Link to="/organizer/my-events" className="text-sm font-bold text-[#4F46E5] hover:underline">
              View Portfolio →
            </Link>
          </div>
          
          {recentEvents.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-50 rounded-2xl">
              <Calendar className="w-10 h-10 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-400">No events created yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
               {recentEvents.map(event => (
                 <EventCard 
                   key={event._id} 
                   event={event} 
                   role="organizer" 
                   showActions={false} 
                 />
               ))}
            </div>
          )}
        </div>

        <div className="flex-[1] bg-white rounded-2xl shadow-sm p-6 flex flex-col h-fit">
          <h4 className="text-lg font-bold text-slate-800 mb-6">Notifications</h4>
          <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-50 rounded-2xl">
            <Bell className="w-10 h-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-400">No notifications yet</p>
          </div>
        </div>
      </section>
    </div>
  )
}

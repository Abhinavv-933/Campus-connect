import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/axios'
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminHome() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, organizers: 0 })
  const [pendingEvents, setPendingEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchAdminData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)
    
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/events/pending')
      ])
      setStats(statsRes.data)
      setPendingEvents(pendingRes.data.slice(0, 5))
      setError(null)
      if (isManual) toast.success('Stats refreshed')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load admin dashboard'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  useEffect(() => {
    if (pendingEvents.length > 0) {
      console.log('PENDING EVENTS:', pendingEvents)
      console.log('FIRST EVENT ORGANIZER:', pendingEvents[0]?.organizerId)
    }
  }, [pendingEvents])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900">Dashboard error</h3>
        <p className="text-zinc-500 max-w-xs">{error}</p>
        <button onClick={() => fetchAdminData()} className="px-6 py-2 bg-zinc-900 text-white rounded-full">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-zinc-900">Dashboard</h2>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['Pending Events', stats.pendingEvents || stats.pending, 'text-amber-600'],
          ['Approved Events', stats.approvedEvents || stats.approved, 'text-emerald-600'],
          ['Rejected Events', stats.rejectedEvents || stats.rejected, 'text-rose-600'],
          ['Total Organizers', stats.totalOrganizers || stats.organizers, 'text-zinc-900'],
        ].map(([label, value, valueColor]) => (
          <div key={label} className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
            <p className="text-sm text-zinc-500 mb-2">{label}</p>
            <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-zinc-900">Pending Approvals</h3>
            <button
              onClick={() => fetchAdminData(true)}
              disabled={isRefreshing}
              className={`p-1.5 rounded-full hover:bg-zinc-100 transition-colors ${isRefreshing ? 'animate-spin text-zinc-400' : 'text-zinc-500'}`}
              title="Refresh stats"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <Link to="/admin/pending" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
            View All →
          </Link>
        </div>

        {pendingEvents.length === 0 ? (
          <p className="py-14 text-center italic text-zinc-500">No pending events</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Title</th>
                  <th className="text-left px-6 py-3 font-semibold">Organizer</th>
                  <th className="text-left px-6 py-3 font-semibold">Date</th>
                  <th className="text-right px-6 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {pendingEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 font-medium text-zinc-900">{event.title}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-zinc-900">
                        {event.organizerId?.name || event.organizerName || 'Unknown'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {event.organizerId?.organization || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/event/${event._id}`} className="text-sm text-zinc-900 font-bold hover:underline">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

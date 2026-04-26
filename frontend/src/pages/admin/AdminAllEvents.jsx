import { useEffect, useState } from 'react'
import api from '../../utils/axios'
import { Loader2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const categories = ['Tech', 'Cultural', 'Sports', 'Workshops', 'Hackathons', 'Clubs', 'Academic']

export default function AdminAllEvents() {
  const [events, setEvents] = useState([])
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [isLoading, setIsLoading] = useState(true)

  const fetchAllEvents = async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (statusFilter !== 'All Statuses') params.status = statusFilter.toLowerCase()
      if (categoryFilter !== 'All Categories') params.category = categoryFilter

      const response = await api.get('/api/admin/all', { params })
      setEvents(response.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllEvents()
  }, [statusFilter, categoryFilter])

  useEffect(() => {
    if (events.length > 0) {
      console.log('PENDING EVENTS:', events)
      console.log('FIRST EVENT ORGANIZER:', events[0]?.organizerId)
    }
  }, [events])

  const statusClasses = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-900">All Events</h2>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-zinc-200 rounded-md text-sm text-zinc-700 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
        >
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-zinc-200 rounded-md text-sm text-zinc-700 focus:ring-2 focus:ring-zinc-900 focus:outline-none"
        >
          <option>All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <section className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden min-h-[400px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50">
            <Loader2 className="w-8 h-8 text-zinc-900 animate-spin" />
            <p className="text-zinc-500 font-medium">Filtering events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center">
            <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="italic text-zinc-500 text-lg">No events found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Title</th>
                  <th className="text-left px-6 py-4 font-semibold">Organizer</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-left px-6 py-4 font-semibold">Date</th>
                  <th className="text-right px-6 py-4 font-semibold">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 font-medium text-zinc-900">{event.title}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-zinc-900">
                        {event.organizerId?.name || event.organizerName || 'Unknown'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {event.organizerId?.organization || '—'}
                      </p>
                      <p className="text-xs text-zinc-400 italic">
                        {event.organizerId?.role || ''}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClasses[event.status]}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-sm">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/event/${event._id}`} className="text-sm text-zinc-900 font-bold hover:underline">
                        View
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

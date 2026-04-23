import { useEffect, useState, useCallback, useRef } from 'react'
import { Calendar, Grid3X3, List, Search, Loader2 } from 'lucide-react'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import EventCard from '../../components/EventCard'

// Lightweight debounce — avoids needing lodash
function useDebounce(fn, delay) {
  const timerRef = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

const categoryOptions = ['All Categories', 'Tech', 'Cultural', 'Sports', 'Workshops', 'Hackathons', 'Clubs', 'Academic']

export default function DiscoverEvents() {
  const [activeTab, setActiveTab] = useState('Upcoming Events')
  const [events, setEvents] = useState([])
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set())
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchEvents = async (query = searchQuery, category = selectedCategory, tab = activeTab) => {
    setIsLoading(true)
    try {
      let endpoint = '/api/student/events'
      const params = {}
      
      if (category !== 'All Categories') params.category = category
      if (query.trim()) params.search = query.trim()
      
      if (tab === 'My Registered Events') {
        endpoint = '/api/student/my-registrations'
      }

      const [eventsRes, registrationsRes] = await Promise.all([
        api.get(endpoint, { params }),
        api.get('/api/student/my-registrations')
      ])

      let fetchedEvents = eventsRes.data
      if (tab === 'Past Events') {
        const today = new Date()
        fetchedEvents = fetchedEvents.filter(e => new Date(e.date) < today)
      } else if (tab === 'Upcoming Events') {
        const today = new Date()
        fetchedEvents = fetchedEvents.filter(e => new Date(e.date) >= today)
      }

      setEvents(fetchedEvents)
      setRegisteredEventIds(new Set(registrationsRes.data.map(e => e._id)))
    } catch (error) {
      toast.error('Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced fetch on search/category/tab changes
  const debouncedFetch = useDebounce(
    (q, c, t) => fetchEvents(q, c, t),
    300
  )

  useEffect(() => {
    debouncedFetch(searchQuery, selectedCategory, activeTab)
  }, [searchQuery, selectedCategory, activeTab])

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/api/student/events/${eventId}/register`)
      toast.success('Registered successfully!')
      
      // Instant UI update
      setRegisteredEventIds(prev => {
        const next = new Set(prev)
        next.add(eventId)
        return next
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  const handleUnregister = async (eventId) => {
    try {
      await api.delete(`/api/student/events/${eventId}/register`)
      toast.success('Unregistered successfully')
      
      // Instant UI update
      setRegisteredEventIds(prev => {
        const next = new Set(prev)
        next.delete(eventId)
        return next
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unregistration failed')
    }
  }

  const tabs = [
    { name: 'Upcoming Events', label: 'Upcoming' },
    { name: 'My Registered Events', label: 'Registered' },
    { name: 'Past Events', label: 'Past' }
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              type="button"
              onClick={() => setActiveTab(tab.name)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === tab.name ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button type="button" className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <Grid3X3 className="w-4 h-4 text-slate-700" />
            </button>
            <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center">
              <List className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[420px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50 z-10">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-medium">Finding amazing events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="h-[420px] flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-full bg-slate-50 mx-auto flex items-center justify-center">
                <Calendar className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-800">No events found</h3>
              <p className="mt-2 text-slate-500">Try adjusting your filters or search keywords.</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isRegistered={registeredEventIds.has(event._id)}
                onRegister={() => handleRegister(event._id)}
                onUnregister={() => handleUnregister(event._id)}
                role="student"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

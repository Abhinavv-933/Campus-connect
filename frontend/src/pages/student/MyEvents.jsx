import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Grid3X3, List, Loader2 } from 'lucide-react'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import EventCard from '../../components/EventCard'

export default function MyEvents() {
  const [activeTab, setActiveTab] = useState('Upcoming Events')
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMyEvents = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/api/student/my-registrations')
      const allEvents = response.data
      const today = new Date()

      if (activeTab === 'Upcoming Events') {
        setEvents(allEvents.filter(e => new Date(e.date) >= today))
      } else {
        setEvents(allEvents.filter(e => new Date(e.date) < today))
      }
    } catch (error) {
      toast.error('Failed to load your registrations')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMyEvents()
  }, [activeTab])

  const handleUnregister = async (eventId) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) return
    
    try {
      await api.delete(`/api/student/events/${eventId}/register`)
      toast.success('Successfully unregistered')
      fetchMyEvents()
    } catch (error) {
      toast.error('Failed to unregister')
    }
  }

  const tabs = ['Upcoming Events', 'Past Events']

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            <p className="text-slate-500 font-medium">Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="h-[420px] flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-full bg-slate-50 mx-auto flex items-center justify-center">
                <Calendar className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-800">
                {activeTab === 'Upcoming Events' ? "No upcoming registrations" : "No past events found"}
              </h3>
              <p className="mt-2 text-slate-500">
                {activeTab === 'Upcoming Events' 
                  ? "Explore the discover tab to find and join exciting campus events!" 
                  : "Events you attend will appear here once they're over."}
              </p>
              {activeTab === 'Upcoming Events' && (
                <Link
                  to="/dashboard/discover"
                  className="mt-6 inline-flex px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                >
                  Browse all events
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isRegistered={true}
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

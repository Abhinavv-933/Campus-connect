import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Filter, Grid3X3, List, Plus, Loader2, AlertCircle } from 'lucide-react'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import EventCard from '../../components/EventCard'

const tabs = ['Approved', 'Pending', 'Rejected']
const categoryOptions = ['All Categories', 'Tech', 'Cultural', 'Sports', 'Workshops', 'Hackathons', 'Clubs', 'Academic']

export default function OrganizerMyEvents() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Approved')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const params = {}
      if (activeTab) params.status = activeTab.toLowerCase()
      if (selectedCategory !== 'All Categories') params.category = selectedCategory

      const response = await api.get('/api/organizer/events', { params })
      setEvents(response.data.events)
      setCounts(response.data.counts || { pending: 0, approved: 0, rejected: 0, total: 0 })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [activeTab, selectedCategory])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return

    setIsDeleting(true)
    try {
      await api.delete(`/api/organizer/events/${id}`)
      toast.success('Event deleted successfully')
      fetchEvents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (id) => {
    navigate(`/organizer/edit-event/${id}`)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 className="text-3xl font-bold text-slate-900">Event Portfolio</h3>
          <p className="text-slate-500 mt-1">Manage and track your submissions</p>
        </div>
        <Link
          to="/organizer/create-event"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA]"
        >
          <Plus className="w-4 h-4" />
          New Event
        </Link>
      </div>

      <div className="mt-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-100 text-[#4F46E5]'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {tab} [{tab === 'Approved' ? counts.approved : tab === 'Pending' ? counts.pending : counts.rejected}]
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button 
              type="button" 
              onClick={() => setViewMode('grid')}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-400'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 min-h-[400px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/50 z-10">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-medium">Fetching events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="mt-4 text-xl font-bold text-slate-800">
                No {activeTab.toLowerCase()} events found
              </h4>
              <p className="text-slate-500 mt-2">
                {selectedCategory === 'All Categories' 
                  ? `You haven't submitted any ${activeTab.toLowerCase()} events yet.`
                  : `No ${activeTab.toLowerCase()} events found in ${selectedCategory} category.`}
              </p>
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                role="organizer"
                variant={viewMode}
                showActions={true}
                onEdit={() => handleEdit(event._id)}
                onDelete={() => handleDelete(event._id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {isDeleting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-[60]">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <p className="font-bold text-slate-900">Deleting event...</p>
          </div>
        </div>
      )}
    </div>
  )
}

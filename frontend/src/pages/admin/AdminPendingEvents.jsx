import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/axios'
import { Loader2, AlertCircle, X, Check, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPendingEvents() {
  const [pendingEvents, setPendingEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchPendingEvents = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/api/admin/events/pending')
      setPendingEvents(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending events')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingEvents()
  }, [])

  const handleApprove = async (eventId) => {
    setIsProcessing(true)
    try {
      await api.patch(`/api/admin/events/${eventId}/approve`)
      toast.success('Event approved')
      fetchPendingEvents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve event')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectClick = (eventId) => {
    setSelectedEventId(eventId)
    setShowRejectModal(true)
    setRejectionReason('')
  }

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason')
      return
    }

    setIsProcessing(true)
    try {
      await api.patch(`/api/admin/events/${selectedEventId}/reject`, { reason: rejectionReason.trim() })
      toast.success('Event rejected')
      setShowRejectModal(false)
      fetchPendingEvents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject event')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading pending events...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-900">Pending Events</h2>

      <section className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        {pendingEvents.length === 0 ? (
          <div className="py-20 text-center">
            <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900">All caught up!</h3>
            <p className="text-zinc-500">No pending events for review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Title</th>
                  <th className="text-left px-6 py-4 font-semibold">Organizer</th>
                  <th className="text-left px-6 py-4 font-semibold">Category</th>
                  <th className="text-left px-6 py-4 font-semibold">Date</th>
                  <th className="text-left px-6 py-4 font-semibold">View</th>
                  <th className="text-right px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {pendingEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 font-medium text-zinc-900">{event.title}</td>
                    <td className="px-6 py-4 text-zinc-600">{event.organizer?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-xs font-semibold uppercase">
                        {event.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-sm">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/admin/event/${event._id}`} className="text-sm text-zinc-900 font-bold hover:underline">
                        Details
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(event._id)}
                          disabled={isProcessing}
                          className="bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectClick(event._id)}
                          disabled={isProcessing}
                          className="bg-rose-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-rose-700 flex items-center gap-1 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-lg font-bold text-zinc-900">Reject Event</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Reason for rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full h-32 px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none text-sm"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-zinc-600 font-semibold hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

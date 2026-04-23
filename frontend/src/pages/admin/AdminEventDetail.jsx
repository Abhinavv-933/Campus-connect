import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Check, X, MessageSquare, Calendar, MapPin, User, Tag, Clock } from 'lucide-react'
import api from '../../utils/axios'
import toast from 'react-hot-toast'

export default function AdminEventDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchEventDetails = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/api/admin/event/${id}`)
      setEvent(response.data)
    } catch (err) {
      toast.error('Failed to load event details')
      navigate('/admin/pending')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await api.patch(`/api/admin/events/${id}/approve`)
      toast.success('Event approved')
      navigate('/admin/pending')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve event')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please enter a rejection reason')
      return
    }

    setIsProcessing(true)
    try {
      await api.patch(`/api/admin/events/${id}/reject`, { reason: rejectionReason.trim() })
      toast.success('Event rejected')
      navigate('/admin/pending')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject event')
    } finally {
      setIsProcessing(false)
    }
  }

  const statusClasses = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading event details...</p>
      </div>
    )
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const formatTime = (time) => time // Assuming it's already a nice string or needs formatting

  return (
    <div className="space-y-6 pb-20">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to list
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden relative">
        {/* Banner Image */}
        {event.imageUrl && (
          <div className="h-64 w-full overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}

        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusClasses[event.status]}`}>
                  {event.status}
                </span>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{event.category}</span>
              </div>
              <h1 className="text-3xl font-bold text-zinc-900">{event.title}</h1>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 border-y border-zinc-100 py-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center flex-shrink-0 text-zinc-400">
                   <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Organizer</p>
                  <p className="text-lg font-semibold text-zinc-900 mt-0.5">{event.organizer?.name || 'Unknown'}</p>
                  <p className="text-sm text-zinc-500">{event.organizer?.organization || 'Individual'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center flex-shrink-0 text-zinc-400">
                   <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Date & Time</p>
                  <p className="text-lg font-semibold text-zinc-900 mt-0.5">{formatDate(event.date)}</p>
                  <p className="text-sm text-zinc-500">{event.startTime} - {event.endTime || 'End'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center flex-shrink-0 text-zinc-400">
                   <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Venue</p>
                  <p className="text-lg font-semibold text-zinc-900 mt-0.5">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center flex-shrink-0 text-zinc-400">
                   <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Submitted At</p>
                  <p className="text-lg font-semibold text-zinc-900 mt-0.5">{formatDate(event.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Event Description</p>
            <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed">
              {event.description}
            </div>
          </div>

          {event.status === 'rejected' && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-6">
              <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">Rejection Reason</p>
              <p className="text-rose-700 font-medium italic">{event.rejectionReason || 'No reason provided.'}</p>
            </div>
          )}
        </div>

        {event.status === 'pending' && (
          <div className="bg-white border-t border-zinc-100 px-8 py-6 flex justify-end gap-4 sticky bottom-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="px-8 py-2.5 border-2 border-rose-100 text-rose-600 rounded-xl font-bold hover:bg-rose-50 disabled:opacity-50 transition-colors"
            >
              Reject Event
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-zinc-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-lg shadow-zinc-200"
            >
              {isProcessing ? 'Processing...' : 'Approve Event'}
            </button>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="text-lg font-bold text-zinc-900">Provide Reason</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
               <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-rose-500" />
               </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Why is this event being rejected?"
                className="w-full h-32 px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none text-sm mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-3 text-zinc-600 font-semibold hover:bg-zinc-50 rounded-xl transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-colors"
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

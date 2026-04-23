import { Calendar, MapPin, Edit2, Trash2, CheckCircle, Users } from 'lucide-react'
import { buildGoogleCalendarUrl } from '../utils/calendar'

const categoryColors = {
  Tech: 'bg-blue-100 text-blue-700',
  Cultural: 'bg-pink-100 text-pink-700',
  Sports: 'bg-orange-100 text-orange-700',
  Workshops: 'bg-green-100 text-green-700',
  Hackathons: 'bg-purple-100 text-purple-700',
  Clubs: 'bg-sky-100 text-sky-700',
  Academic: 'bg-gray-100 text-gray-700',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function EventCard({
  event,
  onRegister,
  onUnregister,
  isRegistered,
  showActions = false,
  onEdit,
  onDelete,
  role = 'student',
  variant = 'grid'
}) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const bannerImage = event.image || event.imageUrl || null
  const registrationCount = event.registrationCount || event.registrations?.length || 0
  const maxParticipants = event.maxParticipants || 100
  const spotsRemaining = maxParticipants - registrationCount
  const progressPercent = Math.min(100, (registrationCount / maxParticipants) * 100)

  let progressColor = 'bg-indigo-500'
  if (progressPercent >= 100) progressColor = 'bg-rose-500'
  else if (progressPercent > 80) progressColor = 'bg-orange-500'

  if (variant === 'list') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-6 hover:shadow-sm transition-shadow">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 truncate">{event.title}</h4>
          <div className="flex items-center gap-4 mt-1">
             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${categoryColors[event.category]}`}>
               {event.category}
             </span>
             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[event.status]}`}>
               {event.status}
             </span>
             <span className="text-xs text-slate-500 flex items-center gap-1">
               <Calendar className="w-3 h-3" /> {formatDate(event.date)}
             </span>
          </div>
        </div>

        <div className="w-48 hidden md:block">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase">
            <span>Progress</span>
            <span>{registrationCount} / {maxParticipants}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className={`h-full ${progressColor} transition-all`} style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(event.status === 'pending' || event.status === 'rejected') && (
            <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {event.status === 'pending' && (
            <button onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Image Section */}
      <div className="relative h-40 overflow-hidden bg-slate-100">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1540575861501-7ad0582373f2?q=80&w=800&auto=format&fit=crop'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <Users className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase ${categoryColors[event.category] || 'bg-slate-100 text-slate-700'}`}>
            {event.category}
          </span>
          {role === 'organizer' && event.status && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase ${statusColors[event.status]}`}>
              {event.status}
              {progressPercent >= 100 && ' • FULL'}
            </span>
          )}
        </div>
        {role === 'student' && isRegistered && (
          <div className="absolute top-3 right-3">
            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" /> Registered
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h4 className="text-base font-bold text-slate-900 line-clamp-1 mb-2">
          {event.title}
        </h4>
        
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(event.date)}</span>
          </div>
        </div>

        {role === 'organizer' && (
           <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-end mb-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrations</p>
                 <p className="text-xs font-bold text-slate-700">{registrationCount} / {maxParticipants}</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                 <div className={`h-full ${progressColor} transition-all`} style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#4F46E5] text-[11px] font-bold">
                  <Users className="w-3.5 h-3.5" />
                  {registrationCount} registered
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                  <Users className="w-3.5 h-3.5" />
                  {spotsRemaining} spots left
                </div>
              </div>
           </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-4">
          {role === 'student' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isRegistered ? (
                  <div className="flex-1 py-2 bg-emerald-100 text-emerald-700 font-semibold text-center rounded-full text-sm border border-emerald-200 cursor-default">
                    ✓ Registered
                  </div>
                ) : (
                  <button
                    onClick={() => onRegister(event._id)}
                    className="flex-1 py-2 rounded-xl bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA] transition-colors text-sm"
                  >
                    Register Now
                  </button>
                )}

                {event.status === 'approved' && (
                  <button
                    onClick={() => window.open(buildGoogleCalendarUrl(event), '_blank')}
                    title="Add to Google Calendar"
                    className="border border-indigo-200 text-indigo-600 rounded-full px-3 py-2 text-xs font-medium hover:bg-indigo-50 flex items-center gap-1 transition-colors h-[38px]"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {isRegistered && onUnregister && (
                <button
                  onClick={() => onUnregister(event._id)}
                  className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-rose-50 transition-colors uppercase tracking-widest"
                >
                  Unregister from Event
                </button>
              )}
            </div>
          )}

          {role === 'organizer' && showActions && (
            <div className="flex gap-2 w-full pt-2">
              {(event.status === 'pending' || event.status === 'rejected') && (
                <button
                  onClick={onEdit}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-xs flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              {event.status === 'pending' && (
                <button
                  onClick={onDelete}
                  className="p-2 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

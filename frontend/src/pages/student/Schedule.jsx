import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, MapPin, Clock, Calendar } from 'lucide-react'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import { buildGoogleCalendarUrl } from '../../utils/calendar'

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const categories = {
  'Tech': 'bg-blue-500',
  'Cultural': 'bg-pink-500',
  'Sports': 'bg-orange-500',
  'Workshops': 'bg-green-500',
  'Hackathons': 'bg-purple-500',
  'Clubs': 'bg-sky-500',
  'Academic': 'bg-slate-700',
}

function createCalendarGrid(dateCursor) {
  const year = dateCursor.getFullYear()
  const month = dateCursor.getMonth()
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const startDay = first.getDay()
  const cells = []

  // Prev month days
  for (let i = startDay - 1; i >= 0; i -= 1) {
    cells.push({ 
      day: daysInPrevMonth - i, 
      currentMonth: false, 
      date: new Date(year, month - 1, daysInPrevMonth - i) 
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ 
      day: d, 
      currentMonth: true, 
      date: new Date(year, month, d) 
    })
  }

  // Next month days
  while (cells.length < 42) {
    const nextDay = cells.length - (startDay + daysInMonth) + 1
    cells.push({ 
      day: nextDay, 
      currentMonth: false, 
      date: new Date(year, month + 1, nextDay) 
    })
  }

  return cells
}

export default function Schedule() {
  const [viewMode, setViewMode] = useState('Month')
  const [dateCursor, setDateCursor] = useState(new Date())
  const [registrations, setRegistrations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const today = new Date()

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await api.get('/api/student/my-registrations')
        setRegistrations(response.data)
      } catch (err) {
        toast.error('Failed to load your schedule')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRegistrations()
  }, [])

  // Helper to check if two dates are same day
  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear()
  }

  // Map events to dates - FIXED to use direct event object
  const eventsByDate = useMemo(() => {
    const map = {}
    registrations.forEach(event => {
      if (event && event.date) {
        const dateStr = new Date(event.date).toDateString()
        if (!map[dateStr]) map[dateStr] = []
        map[dateStr].push(event)
      }
    })
    return map
  }, [registrations])

  const cells = useMemo(() => createCalendarGrid(dateCursor), [dateCursor])

  const handlePrev = () => {
    if (viewMode === 'Month') {
      setDateCursor(new Date(dateCursor.getFullYear(), dateCursor.getMonth() - 1, 1))
    } else if (viewMode === 'Week') {
      const d = new Date(dateCursor)
      d.setDate(d.getDate() - 7)
      setDateCursor(d)
    } else {
      const d = new Date(dateCursor)
      d.setDate(d.getDate() - 1)
      setDateCursor(d)
    }
  }

  const handleNext = () => {
    if (viewMode === 'Month') {
      setDateCursor(new Date(dateCursor.getFullYear(), dateCursor.getMonth() + 1, 1))
    } else if (viewMode === 'Week') {
      const d = new Date(dateCursor)
      d.setDate(d.getDate() + 7)
      setDateCursor(d)
    } else {
      const d = new Date(dateCursor)
      d.setDate(d.getDate() + 1)
      setDateCursor(d)
    }
  }

  const getHeaderLabel = () => {
    if (viewMode === 'Month') {
      return dateCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'Week') {
      const start = new Date(dateCursor)
      start.setDate(start.getDate() - start.getDay())
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      
      const options = { month: 'short', day: 'numeric' }
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${end.getFullYear()}`
    } else {
      return dateCursor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    }
  }

  const renderMonthView = () => {
    return (
      <div className="mt-5 grid grid-cols-7 border border-slate-200 rounded-xl overflow-hidden">
        {weekDays.map((day) => (
          <div key={day} className="h-11 border-b border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">
            {day}
          </div>
        ))}

        {cells.map(({ day, currentMonth, date }, idx) => {
          const isToday = isSameDay(date, today)
          const dayEvents = eventsByDate[date.toDateString()] || []
          
          return (
            <div
              key={`${day}-${idx}`}
              onClick={() => {
                setDateCursor(date)
                setViewMode('Day')
              }}
              className={`h-24 border-b border-r border-slate-200 p-2 cursor-pointer transition-colors hover:bg-slate-50 ${
                isToday ? 'bg-yellow-50' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    isToday
                      ? 'bg-[#4F46E5] text-white font-semibold'
                      : currentMonth
                        ? 'text-slate-700'
                        : 'text-slate-300'
                  }`}
                >
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-1 flex-wrap justify-end">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full ${categories[ev.category] || 'bg-slate-400'}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-1 space-y-1 overflow-hidden">
                {dayEvents.slice(0, 2).map((ev, i) => (
                  <p key={i} className="text-[10px] leading-tight truncate text-slate-600 font-medium bg-slate-100 rounded px-1">
                    {ev.title}
                  </p>
                ))}
                {dayEvents.length > 2 && <p className="text-[9px] text-slate-400">+{dayEvents.length - 2} more</p>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const startOfWeek = new Date(dateCursor)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const weekDaysArr = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(d.getDate() + i)
      weekDaysArr.push(d)
    }

    return (
      <div className="mt-5 grid grid-cols-7 border border-slate-200 rounded-xl overflow-hidden min-h-[400px]">
        {weekDaysArr.map((date, i) => {
          const isToday = isSameDay(date, today)
          const dayEvents = eventsByDate[date.toDateString()] || []
          
          return (
            <div key={i} className="flex flex-col border-r border-slate-200 last:border-r-0">
              <div className={`h-16 flex flex-col items-center justify-center border-b border-slate-200 ${isToday ? 'bg-yellow-50' : 'bg-slate-50'}`}>
                <span className="text-[10px] font-bold text-slate-500">{weekDays[i]}</span>
                <span className={`text-lg font-bold ${isToday ? 'text-[#4F46E5]' : 'text-slate-700'}`}>{date.getDate()}</span>
              </div>
              <div className="flex-1 p-2 space-y-2 bg-white">
                {dayEvents.map((ev, j) => (
                  <div 
                    key={j} 
                    onClick={() => { setDateCursor(date); setViewMode('Day'); }}
                    className={`p-2 rounded-lg text-[11px] font-bold text-white cursor-pointer shadow-sm ${categories[ev.category] || 'bg-slate-400'} hover:brightness-95 transition-all`}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderDayView = () => {
    const dayEvents = eventsByDate[dateCursor.toDateString()] || []
    const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 8 AM to 9 PM

    return (
      <div className="mt-5 flex flex-col md:flex-row gap-6 border border-slate-200 rounded-xl p-6 bg-white">
        <div className="md:w-1/3">
          <h4 className="text-4xl font-extrabold text-slate-900">{dateCursor.getDate()}</h4>
          <p className="text-xl font-bold text-[#4F46E5] uppercase tracking-wide">{dateCursor.toLocaleDateString('en-US', { weekday: 'long' })}</p>
          <p className="text-slate-500 font-medium mt-1">{dateCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <div className="mt-8 space-y-4">
            <h5 className="text-sm font-bold text-slate-400 tracking-widest uppercase">Events for this day</h5>
            {dayEvents.length === 0 ? (
              <p className="text-slate-400 italic text-sm">No events scheduled</p>
            ) : (
              dayEvents.map((ev, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-100 shadow-sm bg-slate-50 group/event">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white mb-2 ${categories[ev.category] || 'bg-slate-400'}`}>
                    {ev.category}
                  </span>
                  <div className="flex justify-between items-start gap-2">
                    <h6 className="font-bold text-slate-900 leading-tight flex-1">{ev.title}</h6>
                    <button
                      onClick={() => window.open(buildGoogleCalendarUrl(ev), '_blank')}
                      title="Add to Google Calendar"
                      className="p-1.5 rounded-full border border-indigo-100 text-indigo-500 hover:bg-white transition-all opacity-0 group-hover/event:opacity-100"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {ev.startTime} {ev.endTime ? `- ${ev.endTime}` : ''}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {ev.venue}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2 border-l border-slate-100 pl-6">
          {hours.map(hour => {
            const timeStr = `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`
            const evAtHour = dayEvents.find(ev => {
              const [h] = ev.startTime.split(':')
              return parseInt(h) === hour
            })

            return (
              <div key={hour} className="flex gap-4 min-h-[50px] items-start group">
                <span className="w-16 text-right text-xs font-bold text-slate-400 mt-1">{timeStr}</span>
                <div className="flex-1 h-px bg-slate-100 mt-3 group-hover:bg-slate-200 transition-colors relative">
                  {evAtHour && (
                    <div className={`absolute top-0 left-0 right-4 p-3 rounded-xl text-white shadow-md ${categories[evAtHour.category] || 'bg-[#4F46E5]'} -translate-y-1/2 z-10`}>
                      <p className="text-xs font-bold">{evAtHour.title}</p>
                      <p className="text-[10px] opacity-80 font-medium">{evAtHour.venue} • {evAtHour.startTime}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        <p className="text-slate-500 font-medium">Building your calendar...</p>
      </div>
    )
  }

  const registeredCount = registrations.length
  const upcomingThisWeekCount = registrations.filter(reg => {
    const eventDate = new Date(reg.date)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return eventDate >= today && eventDate <= nextWeek
  }).length

  return (
    <div className="space-y-4">
      <div className="grid xl:grid-cols-[minmax(0,1fr)_260px] gap-4">
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={() => { setDateCursor(new Date()); if (viewMode === 'Day') setViewMode('Month'); }}
                className="px-4 h-9 rounded-full bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] transition-colors"
              >
                Today
              </button>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 text-center min-w-[200px]">{getHeaderLabel()}</h3>

            <div className="inline-flex bg-indigo-50 rounded-full p-1 w-fit">
              {['Month', 'Week', 'Day'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    viewMode === mode ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-[#4F46E5] hover:bg-indigo-100/50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'Month' && renderMonthView()}
          {viewMode === 'Week' && renderWeekView()}
          {viewMode === 'Day' && renderDayView()}
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h4 className="text-sm font-bold tracking-widest text-slate-500 uppercase">Quick Info</h4>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg">
                <span className="text-slate-600 font-medium">Registered:</span>
                <span className="text-[#4F46E5] font-bold">{registeredCount}</span>
              </div>
              <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg">
                <span className="text-slate-600 font-medium">This Week:</span>
                <span className="text-[#4F46E5] font-bold">{upcomingThisWeekCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-gradient-to-br from-[#4F46E5] to-[#4338CA] shadow-md shadow-indigo-200">
            <h4 className="text-white font-bold">Participation Note</h4>
            <p className="text-indigo-100 text-xs mt-2 leading-relaxed">
              Registered events appear automatically on your calendar. Click on any event to view detailed information and venue maps.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Categories</h4>
            <div className="space-y-2">
              {Object.entries(categories).map(([label, color]) => (
                <div key={label} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

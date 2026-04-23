import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ImageIcon, Upload, X, Loader2, ArrowLeft } from 'lucide-react'
import api from '../../utils/axios'

const categoryOptions = ['Tech', 'Cultural', 'Sports', 'Workshops', 'Hackathons', 'Clubs', 'Academic']

export default function EditEvent() {
  const navigate = useNavigate()
  const { id } = useParams()
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [venue, setVenue] = useState('')
  const [isMultiDay, setIsMultiDay] = useState(false)
  const [eventDate, setEventDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [totalSlots, setTotalSlots] = useState(100)
  const [imageUrl, setImageUrl] = useState('')
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/api/organizer/events/${id}`)
        const event = response.data
        setTitle(event.title)
        setDescription(event.description)
        setCategory(event.category)
        setVenue(event.venue)
        setStartTime(event.startTime)
        setEndTime(event.endTime || '')
        setTotalSlots(event.maxParticipants)
        
        if (event.endDate && event.endDate !== event.date) {
            setIsMultiDay(true)
            setStartDate(event.date.split('T')[0])
            setEndDate(event.endDate.split('T')[0])
        } else {
            setEventDate(event.date.split('T')[0])
        }

        if (event.imageUrl) {
            setBannerPreview(event.imageUrl)
            setImageUrl(event.imageUrl)
        }
      } catch (error) {
        toast.error('Failed to load event details')
        navigate('/organizer/my-events')
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvent()
  }, [id, navigate])

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be up to 5MB')
      return
    }

    setBannerFile(file)
    setBannerPreview(URL.createObjectURL(file))
    setImageUrl('') // Clear URL if file is picked
  }

  const handleClearImage = () => {
    setBannerFile(null)
    setBannerPreview('')
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files?.[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields first
    const hasDate = isMultiDay ? startDate && endDate : eventDate
    if (!title.trim() || !description.trim() || !category || !venue.trim() || !startTime || !hasDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('category', category)
      formData.append('venue', venue.trim())
      formData.append('startTime', startTime)
      formData.append('maxParticipants', totalSlots || 100)
      
      if (isMultiDay) {
        formData.append('date', startDate)
        formData.append('endDate', endDate)
      } else {
        formData.append('date', eventDate)
      }

      if (endTime) formData.append('endTime', endTime)

      // Image handling - CRITICAL
      if (bannerFile) {
        formData.append('image', bannerFile) // raw File object, NOT base64
      } else if (imageUrl && imageUrl.trim()) {
        formData.append('imageUrl', imageUrl.trim())
      }

      await api.patch(`/api/organizer/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Event updated successfully')
      navigate('/organizer/my-events')
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update event'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
        <p className="text-slate-500 font-medium">Loading event details...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/organizer/my-events')}
          className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">Event Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Web Development Workshop"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell students about your event..."
            className="w-full min-h-[120px] px-4 py-3 border border-slate-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="">Select category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="venue" className="block text-sm font-semibold text-slate-700 mb-2">Venue / Location</label>
            <input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g., Main Auditorium"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={isMultiDay}
              onChange={(e) => setIsMultiDay(e.target.checked)}
              className="w-4 h-4 accent-[#4F46E5]"
            />
            Is this a multi-day event?
          </label>
        </div>

        {isMultiDay ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="eventDate" className="block text-sm font-semibold text-slate-700 mb-2">Event Date</label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
            <p className="mt-2 text-xs font-semibold tracking-widest text-slate-400">START TIME</p>
          </div>
          <div>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
            <p className="mt-2 text-xs font-semibold tracking-widest text-slate-400">END TIME (OPTIONAL)</p>
          </div>
          <div>
            <input
              type="number"
              min="1"
              value={totalSlots}
              onChange={(e) => setTotalSlots(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
            <p className="mt-2 text-xs font-semibold tracking-widest text-slate-400">TOTAL SLOTS</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Event Banner Image</label>
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
            }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-indigo-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-indigo-50/40 transition-colors"
          >
            {bannerPreview ? (
              <div className="relative group">
                <img src={bannerPreview} alt="Event banner preview" className="mx-auto max-h-60 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearImage()
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="mt-4 text-sm">
                  <span className="text-[#4F46E5] font-semibold inline-flex items-center gap-1">
                    <Upload className="w-4 h-4" />
                    Upload a file
                  </span>
                  <span className="text-slate-500"> or drag and drop</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-semibold text-slate-700 mb-2">Or use Image URL</label>
          <input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => {
              const url = e.target.value
              setImageUrl(url)
              if (url.trim()) {
                setBannerPreview(url.trim())
                setBannerFile(null) // Clear file if URL is typed
                if (fileInputRef.current) fileInputRef.current.value = ''
              } else if (!bannerFile) {
                setBannerPreview('')
              }
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/organizer/my-events')}
            className="px-4 py-2 text-slate-500 font-semibold hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Event'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

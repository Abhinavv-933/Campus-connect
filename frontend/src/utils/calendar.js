export const buildGoogleCalendarUrl = (event) => {
  const formatDate = (dateStr, timeStr) => {
    const date = new Date(dateStr)
    const [hours, minutes] = (timeStr || '00:00').split(':')
    date.setHours(parseInt(hours), parseInt(minutes), 0)
    // Format: YYYYMMDDTHHmmSSZ
    return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z'
  }

  const start = formatDate(event.date, event.startTime)
  const end = formatDate(event.endDate || event.date, event.endTime || event.startTime)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || '',
    location: event.venue || '',
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

import { useEffect, useState } from 'react'
import api from '../../utils/axios'
import { Loader2, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminOrganizers() {
  const [organizers, setOrganizers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrganizers = async () => {
      setIsLoading(true)
      try {
        const response = await api.get('/api/admin/organizers')
        setOrganizers(response.data)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to fetch organizers')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrganizers()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
        <p className="text-zinc-500 font-medium">Loading organizers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-zinc-900">Organizers</h2>

      <section className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        {organizers.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="italic text-zinc-500 text-lg">No organizers found in the system</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Name</th>
                  <th className="text-left px-6 py-4 font-semibold">Organization</th>
                  <th className="text-left px-6 py-4 font-semibold">Email</th>
                  <th className="text-left px-6 py-4 font-semibold">Total Events</th>
                  <th className="text-left px-6 py-4 font-semibold">Approved</th>
                  <th className="text-left px-6 py-4 font-semibold">Rejected</th>
                  <th className="text-left px-6 py-4 font-semibold">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {organizers.map((organizer) => (
                  <tr key={organizer._id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-zinc-900 font-bold">{organizer.name}</td>
                    <td className="px-6 py-4 text-zinc-600 font-medium">{organizer.organization || 'Individual'}</td>
                    <td className="px-6 py-4 text-zinc-500 text-sm">{organizer.email}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">{organizer.totalEvents}</td>
                    <td className="px-6 py-4 text-emerald-600 font-bold">{organizer.approvedCount}</td>
                    <td className="px-6 py-4 text-rose-600 font-bold">{organizer.rejectedCount}</td>
                    <td className="px-6 py-4 text-amber-600 font-bold">{organizer.pendingCount}</td>
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

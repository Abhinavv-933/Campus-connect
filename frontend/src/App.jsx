import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './routes/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import DiscoverEvents from './pages/student/DiscoverEvents'
import Schedule from './pages/student/Schedule'
import MyEvents from './pages/student/MyEvents'
import OrganizerLayout from './pages/organizer/OrganizerLayout'
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import OrganizerMyEvents from './pages/organizer/OrganizerMyEvents'
import CreateEvent from './pages/organizer/CreateEvent'
import EditEvent from './pages/organizer/EditEvent'
import AdminLayout from './pages/admin/AdminLayout'
import AdminHome from './pages/admin/AdminHome'
import AdminPendingEvents from './pages/admin/AdminPendingEvents'
import AdminAllEvents from './pages/admin/AdminAllEvents'
import AdminEventDetail from './pages/admin/AdminEventDetail'
import AdminOrganizers from './pages/admin/AdminOrganizers'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/dashboard" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="discover" element={<DiscoverEvents />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="my-events" element={<MyEvents />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
        <Route path="/organizer" element={<OrganizerLayout />}>
          <Route path="dashboard" element={<OrganizerDashboard />} />
          <Route path="my-events" element={<OrganizerMyEvents />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="edit-event/:id" element={<EditEvent />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="pending" element={<AdminPendingEvents />} />
          <Route path="events" element={<AdminAllEvents />} />
          <Route path="event/:id" element={<AdminEventDetail />} />
          <Route path="organizers" element={<AdminOrganizers />} />
        </Route>
      </Route>
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-700">Page not found</h1>
          </div>
        }
      />
    </Routes>
  )
}

export default App
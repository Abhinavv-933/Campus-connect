import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { GraduationCap, Users, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register, getErrorMessage } = useAuth()

  const [activeRole, setActiveRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',    
    organization: '',         
    orgRole: '', 
  })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      const data = await register({
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        role: activeRole 
      }) 
      toast.success('Account created successfully!')
      const role = data?.user?.role
      navigate(role === 'organizer' ? '/organizer/dashboard' : '/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
        
        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveRole('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${
              activeRole === 'student'
                ? 'bg-white text-[#4F46E5] shadow'
                : 'text-gray-400'
            }`}
          >
            <GraduationCap size={16} /> Student
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('organizer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${
              activeRole === 'organizer'
                ? 'bg-white text-[#4F46E5] shadow'
                : 'text-gray-400'
            }`}
          >
            <Users size={16} /> Organizer
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* KEEP: Full name - unchanged */}
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />

          {/* KEEP: Email - unchanged */}
          <input
            name="email"
            type="email"
            placeholder="Email address"
            required
            value={formData.email}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />

          {/* ADD: Organizer-only fields */}
          {activeRole === 'organizer' && (
            <div className="flex gap-3">
              <input
                name="organization"
                type="text"
                placeholder="Organization / Club Name"
                value={formData.organization}
                onChange={onChange}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
              <input
                name="orgRole"
                type="text"
                placeholder="Role (e.g. Coordinator)"
                value={formData.orgRole}
                onChange={onChange}
                className="flex-1 px-1 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          )}

          {/* CHANGE: Password row with confirm + eye toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                minLength={6}
                required
                value={formData.password}
                onChange={onChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={onChange}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          {/* CHANGE: dynamic button text */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#4F46E5] text-white py-3 rounded-xl font-semibold hover:opacity-95 disabled:opacity-70"
          >
            {submitting ? 'Creating account...' : `Sign Up as ${activeRole === 'student' ? 'Student' : 'Organizer'}`}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4F46E5] font-semibold hover:underline">
            Log in
          </Link>
        </p>

        {/* ADD: Social login divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-wider">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-full py-2.5 text-sm font-medium hover:bg-gray-50">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
            Sign in with Google
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-black text-white rounded-full py-2.5 text-sm font-medium hover:opacity-90">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
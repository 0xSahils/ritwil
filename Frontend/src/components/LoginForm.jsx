import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    login(email, password)
      .then((user) => {
        if (user.role === 'S1_ADMIN') {
          navigate('/admin/dashboard')
        } else if (user.role === 'SUPER_ADMIN') {
          navigate('/team')
        } else if (user.role === 'TEAM_LEAD') {
          navigate('/teamlead')
        } else if (user.role === 'EMPLOYEE') {
          const slug = (user.name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || user.id
          navigate(`/employee/${slug}`, {
            state: {
              employeeId: user.id,
            },
          })
        } else {
          navigate('/')
        }
      })
      .catch((err) => {
        setError(err.message || 'Invalid email or password')
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
      {/* Clean Light Modern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/30"></div>
        
        {/* Large soft gradient orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full blur-3xl animate-float-gentle"></div>
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-gradient-to-br from-indigo-100/25 to-purple-100/20 rounded-full blur-3xl animate-float-gentle-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-100/20 to-blue-100/15 rounded-full blur-3xl animate-float-gentle-slow"></div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-20 left-1/4 w-1 h-1 bg-blue-400/30 rounded-full"></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-indigo-400/30 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-400/30 rounded-full"></div>
        
        {/* Light pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)', backgroundSize: '80px 80px'}}></div>
      </div>
      
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative z-10">
      {/* Left Section - Welcome Back */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 md:w-1/2 p-12 flex flex-col justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-30"></div>
        <div className="absolute top-5 right-20 w-20 h-20 bg-blue-200 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-700 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-300 rounded-full opacity-15"></div>
        
        {/* Company Name */}
        <div className="absolute top-8 left-8 flex items-center space-x-2 text-white">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
          </svg>
          <span className="text-sm font-semibold uppercase tracking-wide">Vbeyond Corporation</span>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-white">
          <p className="text-sm mb-3 opacity-90">Nice to see you again</p>
          <h1 className="text-5xl font-bold mb-6 tracking-wide">WELCOME BACK</h1>
          <p className="text-sm leading-relaxed opacity-80 max-w-md">
           
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="md:w-1/2 p-12 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Login Account</h2>
          <div className="w-16 h-1 bg-blue-500 mb-8"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none transition-colors duration-300 bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Password Input */}
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none transition-colors duration-300 bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Keep me signed in & Already a member */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="ml-2 text-gray-600 group-hover:text-gray-800">Keep me signed in</span>
              </label>
              <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
                Already a member?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg uppercase tracking-wide"
            >
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  )
}

export default LoginForm


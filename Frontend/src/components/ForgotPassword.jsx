import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiRequest } from '../api/client'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [resetLink, setResetLink] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setResetLink(null)
    setSubmitting(true)
    try {
      const res = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
        credentials: 'include',
      }, { skipAuth: true })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }
      setMessage(data.message || 'If an account exists with this email, you will receive reset instructions.')
      if (data.resetLink) setResetLink(data.resetLink)
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/30" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-gradient-to-br from-indigo-100/25 to-purple-100/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 w-full max-w-md relative z-10"
      >
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Forgot password</h1>
        <p className="text-slate-600 text-sm mb-6">
          Enter your email and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {message && !resetLink && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}
          {resetLink && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm space-y-2">
              <p>Email is not configured. Use this link to reset (valid 1 hour):</p>
              <a
                href={resetLink}
                className="block break-all text-blue-600 hover:underline font-medium"
              >
                {resetLink}
              </a>
            </div>
          )}

          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default ForgotPassword

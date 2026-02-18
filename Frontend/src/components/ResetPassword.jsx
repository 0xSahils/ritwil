import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { apiRequest } from '../api/client'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!token.trim()) {
      setError('Invalid reset link. Please request a new one.')
      return
    }
    setSubmitting(true)
    try {
      const res = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
        credentials: 'include',
      }, { skipAuth: true })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to reset password')
        return
      }
      setSuccess(true)
      setTimeout(() => navigate('/', { state: { message: data.message } }), 2000)
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token.trim()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-md w-full text-center"
        >
          <h1 className="text-xl font-semibold text-slate-800 mb-2">Invalid reset link</h1>
          <p className="text-slate-600 text-sm mb-6">
            This link is missing the reset token. Please use the link from your email or request a new one.
          </p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline font-medium">
            Request new reset link
          </Link>
          <span className="mx-2 text-slate-400">|</span>
          <Link to="/" className="text-blue-600 hover:underline font-medium">
            Back to login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/30" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 w-full max-w-md relative z-10"
      >
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Set new password</h1>
        <p className="text-slate-600 text-sm mb-6">
          Enter your new password below. It must be at least 6 characters.
        </p>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm">
            Password reset successfully. Redirecting to login…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {submitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default ResetPassword

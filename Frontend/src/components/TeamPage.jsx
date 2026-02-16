import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSuperAdminDashboard } from '../hooks/useDashboard'
import { apiRequest } from '../api/client'
import { Skeleton } from './common/Skeleton'
import AdminUserManagement from './AdminUserManagement'
import HeadPlacementsView from './HeadPlacementsView'
import CalculationService from '../utils/calculationService'
import PieChart from './PieChart'
import RecursiveMemberNode from './RecursiveMemberNode'
import { motion, AnimatePresence, useInView } from 'framer-motion'

// Animation variants for premium motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// Count-up animation hook
const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return

    let startTime = null
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(start + (end - start) * easeOutQuart))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isInView, end, duration, start])

  return { count, ref }
}

// Stat cards – reference style: white card, vibrant gradient icon box (white icon), thin accent border, bold colored value
const StatCard = ({ label, value, icon, iconGradient, accentBorder, accentText, dotBg, delay = 0 }) => {
  const { count, ref } = useCountUp(typeof value === 'number' ? value : 0)
  const displayValue = typeof value === 'number' ? count : value
  const bgDot = dotBg ?? (accentText === 'text-violet-600' ? 'bg-violet-500' : accentText === 'text-blue-600' ? 'bg-blue-500' : accentText === 'text-emerald-600' ? 'bg-emerald-500' : 'bg-amber-500')

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay, type: 'spring', stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/60 border ${accentBorder} hover:shadow-xl transition-all duration-300`}
    >

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg`}>
            <span className="text-white [&_svg]:w-7 [&_svg]:h-7 [&_svg]:stroke-[2.5]">{icon}</span>
          </div>
          <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1 ${bgDot}`} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{label}</p>
        <p className={`text-3xl font-bold ${accentText}`}>
          {displayValue}
        </p>
      </div>
    </motion.div>
  )
}

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 md:p-8">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Super User Card Skeleton */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-5 w-32 rounded-lg" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Teams List Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="pl-6 border-l-2 border-slate-200">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-32 rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex gap-8">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-5 w-24 rounded" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-5 w-24 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const TeamPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [expandedTeams, setExpandedTeams] = useState({})
  const [expandedMembers, setExpandedMembers] = useState({})
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(!!user?.mfaEnabled)
  const [mfaQrCode, setMfaQrCode] = useState(null)
  const [mfaSecret, setMfaSecret] = useState(null)
  const [mfaToken, setMfaToken] = useState('')
  const [mfaDisablePassword, setMfaDisablePassword] = useState('')
  const [showMfaDisableForm, setShowMfaDisableForm] = useState(false)
  const [mfaMessage, setMfaMessage] = useState('')
  const [mfaDisableLoading, setMfaDisableLoading] = useState(false)
  
  const { data: teamData, isLoading, error, refetch } = useSuperAdminDashboard()

  useEffect(() => {
    const enabled = user?.mfaEnabled ?? (() => {
      try {
        const stored = localStorage.getItem('user')
        return stored ? (JSON.parse(stored).mfaEnabled || false) : false
      } catch {
        return false
      }
    })()
    setMfaEnabled(!!enabled)
  }, [user?.mfaEnabled, settingsOpen])

  useEffect(() => {
    if (!settingsOpen) {
      setMfaQrCode(null)
      setMfaSecret(null)
      setMfaToken('')
      setMfaMessage('')
      setShowMfaDisableForm(false)
      setMfaDisablePassword('')
    }
  }, [settingsOpen])

  const toggleTeam = useCallback((teamId) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }))
  }, [])

  const toggleMember = useCallback((memberId) => {
    setExpandedMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }))
  }, [])

  const [activeSection, setActiveSection] = useState('hierarchy')
  const [autoOpenCreate, setAutoOpenCreate] = useState(false)

  const handleLogout = () => {
    logout().finally(() => {
      navigate('/')
    })
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    const { oldPassword, newPassword, confirmPassword } = passwordForm
    if (!oldPassword) {
      setPasswordError('Please enter your current password')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (oldPassword === newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    setPasswordLoading(true)
    try {
      const res = await apiRequest(`/users/${user?.id}`, {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, password: newPassword }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update password')
      }
      setPasswordSuccess('Password updated successfully.')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => {
        setSettingsOpen(false)
        setPasswordSuccess('')
      }, 1500)
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const startMfaSetup = async () => {
    setMfaMessage('')
    try {
      const res = await apiRequest('/auth/mfa/setup', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setMfaQrCode(data.qrCode)
        setMfaSecret(data.secret)
        setMfaMessage('Scan the QR code with your app and enter the 6-digit code below.')
      } else {
        const data = await res.json().catch(() => ({}))
        setMfaMessage(data.error || 'Failed to start MFA setup')
      }
    } catch (e) {
      setMfaMessage('Error: ' + (e.message || 'Failed to start setup'))
    }
  }

  const verifyMfaSetup = async () => {
    const code = String(mfaToken).replace(/\s/g, '').trim()
    if (!/^\d{6}$/.test(code)) {
      setMfaMessage('Enter a 6-digit code from your authenticator app.')
      return
    }
    setMfaMessage('')
    try {
      const res = await apiRequest('/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({ token: code }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setMfaEnabled(true)
          setMfaMessage('MFA enabled successfully.')
          setMfaQrCode(null)
          setMfaSecret(null)
          setMfaToken('')
          const stored = localStorage.getItem('user')
          if (stored) {
            const u = JSON.parse(stored)
            u.mfaEnabled = true
            localStorage.setItem('user', JSON.stringify(u))
          }
        } else {
          setMfaMessage('Invalid code. Try again.')
        }
      } else {
        setMfaMessage('Verification failed. Try again.')
      }
    } catch (e) {
      setMfaMessage('Error: ' + (e.message || 'Verification failed'))
    }
  }

  const handleDisableMfa = async () => {
    if (!mfaDisablePassword) {
      setMfaMessage('Please enter your password to disable MFA.')
      return
    }
    setMfaDisableLoading(true)
    setMfaMessage('')
    try {
      const res = await apiRequest('/auth/mfa/disable', {
        method: 'POST',
        body: JSON.stringify({ password: mfaDisablePassword }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setMfaEnabled(false)
          setMfaMessage('MFA disabled successfully.')
          setMfaDisablePassword('')
          setShowMfaDisableForm(false)
          const stored = localStorage.getItem('user')
          if (stored) {
            const u = JSON.parse(stored)
            u.mfaEnabled = false
            localStorage.setItem('user', JSON.stringify(u))
          }
        }
      } else {
        const data = await res.json().catch(() => ({}))
        setMfaMessage(data.error || 'Failed to disable MFA')
      }
    } catch (e) {
      setMfaMessage('Error: ' + (e.message || 'Failed to disable MFA'))
    } finally {
      setMfaDisableLoading(false)
    }
  }

  const handleMemberClick = useCallback((member, lead, team, viewParam) => {
    const slug = (member.name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || member.id
    
    // Normalize viewParam to include ?view= if it's a raw string like 'team' or 'personal'
    if (!viewParam) {
      const isLead = member.role === 'TEAM_LEAD' || (member.level && ['L2', 'L3'].includes(member.level.toUpperCase()));
      viewParam = isLead ? '?view=team' : '?view=personal';
    } else if (!viewParam.startsWith('?')) {
      viewParam = `?view=${viewParam}`;
    }
    
    navigate(`/employee/${slug}${viewParam}`, {
      state: {
        employeeId: member.id,
      },
    })
  }, [navigate])

  const getTeamColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'from-sky-400/90 to-blue-500/90',
        light: 'from-sky-50/50 to-blue-50/50',
        border: 'border-sky-200/60',
        text: 'text-sky-700',
        badge: 'bg-sky-100',
        badgeText: 'text-sky-700',
        icon: 'bg-sky-500/10'
      },
      orange: {
        bg: 'from-amber-400/90 to-orange-500/90',
        light: 'from-amber-50/50 to-orange-50/50',
        border: 'border-amber-200/60',
        text: 'text-amber-700',
        badge: 'bg-amber-100',
        badgeText: 'text-amber-700',
        icon: 'bg-amber-500/10'
      },
      purple: {
        bg: 'from-violet-400/90 to-purple-500/90',
        light: 'from-violet-50/50 to-purple-50/50',
        border: 'border-violet-200/60',
        text: 'text-violet-700',
        badge: 'bg-violet-100',
        badgeText: 'text-violet-700',
        icon: 'bg-violet-500/10'
      },
      green: {
        bg: 'from-emerald-400/90 to-teal-500/90',
        light: 'from-emerald-50/50 to-teal-50/50',
        border: 'border-emerald-200/60',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100',
        badgeText: 'text-emerald-700',
        icon: 'bg-emerald-500/10'
      }
    }
    return colors[color] || colors.blue
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 px-8 py-6 max-w-md w-full text-center"
        >
          <p className="text-rose-600 font-medium mb-4">{error.message || 'Something went wrong'}</p>
          <motion.button
            onClick={() => refetch()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transition-shadow"
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // Calculate stats for premium cards
  const totalTeams = teamData?.teams?.length || 0
  const totalLeads = teamData?.teams?.reduce((acc, team) => acc + (team.teamLeads?.length || 0), 0) || 0
  const totalMembers = teamData?.teams?.reduce((acc, team) => 
    acc + (team.teamLeads?.reduce((sum, lead) => sum + (lead.members?.length || 0), 0) || 0), 0
  ) || 0

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* Premium Dark Sidebar – rich gradient */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed left-0 top-0 z-30 flex w-20 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/80"
      >
        <div className="flex flex-col items-center gap-2 py-4 px-2 border-b border-slate-700/60">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 text-white shadow-lg shadow-violet-500/40 ring-2 ring-white/20 shrink-0"
          >
            <span className="text-lg font-bold">V</span>
          </motion.div>
          <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight tracking-wide">
            VBeyond Corp
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {[
            { id: 'hierarchy', label: 'Dashboard', icon: 'dashboard' },
            { id: 'placements', label: 'Placements', icon: 'placements' },
            { id: 'users', label: 'Users', icon: 'users' },
          ].map((item) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 text-center transition-colors ${
                activeSection === item.id
                  ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/40 ring-1 ring-white/30'
                  : 'text-slate-400 hover:bg-indigo-500/20 hover:text-white'
              }`}
              title={item.label}
            >
              {item.icon === 'dashboard' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )}
              {item.icon === 'placements' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )}
              {item.icon === 'users' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>
        <div className="border-t border-slate-700/60 p-2 space-y-1">
          <motion.button
            type="button"
            onClick={() => setSettingsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="flex w-full flex-col items-center gap-1 rounded-xl py-3 text-slate-400 transition-colors hover:bg-indigo-500/20 hover:text-white"
            title="Settings"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium">Settings</span>
          </motion.button>
          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="flex w-full flex-col items-center gap-1 rounded-xl py-3 text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-200"
            title="Logout"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col pl-20">
        {/* Premium Header with Dark Gradient Navigation */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-indigo-100 bg-white/90 px-6 py-4 backdrop-blur-md shadow-sm shadow-slate-200/50"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {activeSection === 'hierarchy' ? 'Organization Dashboard' : activeSection === 'placements' ? 'Head Placements' : 'User Management'}
              </h1>
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex bg-gradient-to-r from-slate-800 via-indigo-800/90 to-slate-800 rounded-full p-1.5 shadow-lg ring-1 ring-indigo-200/50"
            >
              {[
                { id: 'hierarchy', label: 'Dashboard' },
                { id: 'placements', label: 'Placements' },
                { id: 'users', label: 'Users' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className={`px-4 py-2 rounded-full font-medium text-xs md:text-sm transition-all duration-300 ${
                    activeSection === tab.id
                      ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200/50'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-500/40'
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-gradient-to-r from-slate-50 to-indigo-50/50 pl-2 pr-4 py-2 shadow-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 text-sm font-bold text-white shadow-md ring-2 ring-white/50">
                {(teamData?.superUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">{teamData?.superUser?.name ?? 'Admin'}</p>
                <p className="text-xs text-slate-500">Super User</p>
              </div>
            </motion.div>
          </div>
        </motion.header>

        <main className="relative flex-1 p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] bg-[size:24px_24px]" />
          <AnimatePresence mode="wait">
            {activeSection === 'hierarchy' && (
              <motion.div
                key="hierarchy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 space-y-8"
              >
                {/* Premium Stats Cards */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <StatCard
                    label="Total Teams"
                    value={totalTeams}
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    }
                    iconGradient="from-violet-400 to-violet-600"
                    accentBorder="border-violet-400"
                    accentText="text-violet-600"
                    delay={0.1}
                  />
                  <StatCard
                    label="Team Leads"
                    value={totalLeads}
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                    iconGradient="from-blue-400 to-blue-600"
                    accentBorder="border-blue-400"
                    accentText="text-blue-600"
                    delay={0.2}
                  />
                  <StatCard
                    label="Total Members"
                    value={totalMembers}
                    icon={
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                    iconGradient="from-emerald-400 to-emerald-600"
                    accentBorder="border-emerald-400"
                    accentText="text-emerald-600"
                    delay={0.3}
                  />
                </motion.div>

                {/* Super User Hero Card – rich gradient + orbs */}
                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/90 to-slate-900 p-8 shadow-2xl shadow-indigo-900/20 ring-1 ring-white/10"
                >
                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 opacity-25"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'linear',
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #a78bfa 50%, #60a5fa 75%, #22d3ee 100%)',
                      backgroundSize: '200% 200%',
                    }}
                  />
                  
                  {/* Floating orbs – colored */}
                  <motion.div
                    className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-indigo-400/15 blur-2xl"
                    animate={{ y: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute top-1/2 right-1/4 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg" />
                        <div className="relative bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.div>
                      <div>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="flex items-center gap-3 mb-2"
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.6)] ring-2 ring-emerald-300/50" />
                          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-200">Super User</span>
                        </motion.div>
                        <motion.h2
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                          className="text-4xl font-bold text-white tracking-tight"
                        >
                          {teamData?.superUser?.name || 'Super Admin'}
                        </motion.h2>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-violet-500/20 backdrop-blur-sm px-5 py-3 rounded-xl text-sm font-medium border border-violet-400/30 hover:bg-violet-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <svg className="w-4 h-4 text-violet-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          {totalTeams} Teams
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-blue-500/20 backdrop-blur-sm px-5 py-3 rounded-xl text-sm font-medium border border-blue-400/30 hover:bg-blue-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                          {totalLeads} Leads
                        </div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-emerald-500/20 backdrop-blur-sm px-5 py-3 rounded-xl text-sm font-medium border border-emerald-400/30 hover:bg-emerald-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <svg className="w-4 h-4 text-emerald-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          {totalMembers} Members
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Teams Section with Premium Cards */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {teamData?.teams?.map((team, teamIndex) => {
                    const colorClasses = getTeamColorClasses(team.color)
                    const isPlacementTeam = team.isPlacementTeam
                    const calculatedTeamTarget = team.teamTarget || team.teamLeads?.reduce((sum, lead) => {
                      const leadTarget = Number(lead.target || 0)
                      return sum + leadTarget
                    }, 0) || 0
                    const formattedTeamTarget = isPlacementTeam 
                      ? calculatedTeamTarget 
                      : CalculationService.formatCurrency(calculatedTeamTarget)
                    const teamMembersCount = team.teamLeads?.reduce((acc, lead) => acc + (lead.members?.length || 0), 0) || 0
                    
                    return (
                      <motion.div
                        key={team.id}
                        variants={itemVariants}
                        custom={teamIndex}
                        className="group relative"
                      >
                        <motion.div
                          whileHover={{ scale: 1.01, y: -2 }}
                          className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-slate-100 ring-1 ring-slate-200/50 hover:shadow-xl hover:ring-2 hover:ring-slate-300/50 transition-all duration-300`}
                        >
                          {/* Gradient accent bar – thicker */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${colorClasses.bg} rounded-l-2xl shadow-sm`} />
                          
                          {/* Hover glow effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300 rounded-2xl`} />
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-5 flex-1">
                              {/* Team Number Badge */}
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`relative ${colorClasses.icon} w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg ${colorClasses.text} shadow-md`}
                              >
                                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} rounded-xl opacity-20`} />
                                <span className="relative z-10">{teamIndex + 1}</span>
                              </motion.div>
                              
                              {/* Team Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className={`text-xl font-bold ${colorClasses.text}`}>
                                    {team.name}
                                  </h3>
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`w-2 h-2 rounded-full ${colorClasses.badge}`}
                                  />
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                    </svg>
                                    <span className="font-medium">{team.teamLeads?.length || 0} Lead{(team.teamLeads?.length || 0) !== 1 ? 's' : ''}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    <span className="font-medium">{teamMembersCount} Members</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Right side - Expand */}
                            <div className="flex items-center gap-4">
                              <motion.button
                                onClick={() => toggleTeam(team.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`p-2 rounded-lg ${colorClasses.badge} transition-colors`}
                              >
                                <motion.svg
                                  animate={{ rotate: expandedTeams[team.id] ? 180 : 0 }}
                                  transition={{ duration: 0.3 }}
                                  className={`w-5 h-5 ${colorClasses.text}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>

                        {/* Team Leads and Members - Premium Expanded Section */}
                        <AnimatePresence>
                          {expandedTeams[team.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="mt-4 ml-6 space-y-4 overflow-hidden"
                            >
                              {team.teamLeads?.map((lead, leadIndex) => {
                                const levelBg = lead.level === 'L2' ? 'bg-amber-500/90' : lead.level === 'L3' ? 'bg-teal-500/90' : 'bg-slate-500/90'
                                const levelBgLight = lead.level === 'L2' ? 'bg-amber-50/50' : lead.level === 'L3' ? 'bg-teal-50/50' : 'bg-slate-50/50'
                                const levelBorder = lead.level === 'L2' ? 'border-amber-200/50' : lead.level === 'L3' ? 'border-teal-200/50' : 'border-slate-200/50'
                                const levelText = lead.level === 'L2' ? 'text-amber-700' : lead.level === 'L3' ? 'text-teal-700' : 'text-slate-700'
                                const levelBadge = lead.level === 'L2' ? 'bg-amber-100' : lead.level === 'L3' ? 'bg-teal-100' : 'bg-slate-100'
                                const isL2OrL3 = lead.level === 'L2' || lead.level === 'L3'
                                const leadTeamSummary = lead.teamSummary || {}
                                const hasLeadTeamSummary = isL2OrL3 && Object.keys(leadTeamSummary).length > 0
                                const leadTargetLabel = hasLeadTeamSummary ? (isPlacementTeam ? 'Placement Target' : 'Revenue Target') : 'Total Target'
                                const leadAchievedLabel = hasLeadTeamSummary ? (isPlacementTeam ? 'Placements Done' : 'Revenue Achieved') : 'Achieved'
                                const leadTargetVal = hasLeadTeamSummary
                                  ? (isPlacementTeam ? (leadTeamSummary.yearlyPlacementTarget ?? lead.target ?? 0) : (leadTeamSummary.yearlyRevenueTarget ?? lead.target ?? 0))
                                  : lead.target
                                const leadAchievedVal = hasLeadTeamSummary
                                  ? (isPlacementTeam ? (leadTeamSummary.placementDone ?? lead.totalPlacements ?? 0) : (leadTeamSummary.revenueAch ?? lead.totalRevenue ?? 0))
                                  : (isPlacementTeam ? (lead.totalPlacements || lead.placements || 0) : (lead.totalRevenue || 0))
                                const leadPctVal = hasLeadTeamSummary
                                  ? (isPlacementTeam ? (leadTeamSummary.placementAchPercent ?? lead.targetAchieved) : (leadTeamSummary.revenueTargetAchievedPercent ?? lead.targetAchieved))
                                  : lead.targetAchieved

                                return (
                                  <motion.div
                                    key={lead.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: leadIndex * 0.05, duration: 0.3 }}
                                    className="relative pl-6 border-l-2 border-slate-200"
                                  >
                                    {/* Connector Dot – colored */}
                                    <div className="absolute left-0 top-6 w-3 h-3 bg-gradient-to-br from-indigo-300 to-violet-400 rounded-full -translate-x-[7px] shadow-md ring-2 ring-white" />
                                    
                                    {/* Premium Team Lead Card */}
                                    <motion.div
                                      whileHover={{ scale: 1.01, x: 4 }}
                                      className={`relative overflow-hidden ${levelBgLight} backdrop-blur-sm border ${levelBorder} p-5 rounded-xl shadow-md hover:shadow-lg ring-1 ring-slate-200/50 transition-all duration-300 group cursor-pointer`}
                                      onClick={() => handleMemberClick(lead, lead, team)}
                                    >
                                      {/* Gradient accent */}
                                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${levelBg.replace('/90', '')} rounded-l-xl`} />
                                      
                                      <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4 flex-1">
                                          {/* Lead Avatar */}
                                          <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className={`relative ${levelBg} text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}
                                          >
                                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                          </motion.div>
                                          
                                          {/* Lead Info */}
                                          <div className="flex-1">
                                            <div className={`font-bold ${levelText} text-base flex items-center gap-2 mb-1 group-hover:text-blue-700 transition-colors`}>
                                              {lead.name}
                                              <motion.svg
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="w-4 h-4 opacity-60"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                              </motion.svg>
                                            </div>
                                            {((leadTargetVal != null && leadTargetVal !== '') || lead.target) && (
                                              <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                                                <div className="flex items-center gap-1.5">
                                                  <span className="font-semibold text-slate-500">Target:</span>
                                                  <span className="font-bold text-slate-800">
                                                    {isPlacementTeam ? (leadTargetVal ?? 0) : CalculationService.formatCurrency(leadTargetVal ?? 0)}
                                                  </span>
                                                </div>
                                                <span className="text-slate-300">•</span>
                                                <div className="flex items-center gap-1.5">
                                                  <span className="font-semibold text-slate-500">Achieved:</span>
                                                  <span className="font-bold text-emerald-600">
                                                    {isPlacementTeam ? (leadAchievedVal ?? 0) : CalculationService.formatCurrency(leadAchievedVal ?? 0)}
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Right side - Chart and Expand */}
                                        <div className="flex items-center gap-3">
                                          {(leadPctVal != null && leadPctVal !== '') && (
                                            <PieChart 
                                              percentage={Number(leadPctVal || 0)} 
                                              size={50}
                                              colorClass={levelText}
                                            />
                                          )}
                                          {lead.members?.length > 0 && (
                                            <>
                                              <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className={`${levelBadge} ${levelText} px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm`}
                                              >
                                                {lead.members.length} {lead.members.length === 1 ? 'Member' : 'Members'}
                                              </motion.div>
                                              <motion.button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleMember(lead.id);
                                                }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                                              >
                                                <motion.svg
                                                  animate={{ rotate: expandedMembers[lead.id] ? 180 : 0 }}
                                                  transition={{ duration: 0.3 }}
                                                  className="w-5 h-5 text-slate-500"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </motion.svg>
                                              </motion.button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>

                                    {/* Nested Members Hierarchy */}
                                    <AnimatePresence>
                                      {expandedMembers[lead.id] && lead.members?.length > 0 && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="mt-3 ml-6 space-y-3 overflow-hidden"
                                        >
                                          {lead.members.map((member, memberIndex) => (
                                            <motion.div
                                              key={member.id}
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: memberIndex * 0.03 }}
                                            >
                                              <RecursiveMemberNode 
                                                member={member} 
                                                expandedMembers={expandedMembers}
                                                toggleMember={toggleMember}
                                                handleMemberClick={handleMemberClick}
                                                colorClasses={colorClasses}
                                                lead={lead}
                                                team={team}
                                                depth={0}
                                              />
                                            </motion.div>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                )
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </motion.div>
            )}
            {activeSection === 'placements' && (
              <motion.div
                key="placements"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <HeadPlacementsView />
              </motion.div>
            )}
          </AnimatePresence>
          {activeSection === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <AdminUserManagement 
                embedded 
                autoOpenCreate={autoOpenCreate} 
                onModalOpened={() => setAutoOpenCreate(false)} 
              />
            </motion.div>
          )}
        </main>
      </div>

      {/* Settings modal – change password */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={() => !passwordLoading && !mfaDisableLoading && setSettingsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 pb-4 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold text-slate-900">Settings</h3>
                <button
                  type="button"
                  onClick={() => !passwordLoading && !mfaDisableLoading && setSettingsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 pb-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-700">Change password</h4>
                <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{passwordSuccess}</p>
                )}
                <div>
                  <label htmlFor="team-old-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Current password
                  </label>
                  <input
                    id="team-old-password"
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="team-new-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    New password
                  </label>
                  <input
                    id="team-new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="team-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirm password
                  </label>
                  <input
                    id="team-confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => !passwordLoading && setSettingsOpen(false)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60"
                  >
                    {passwordLoading ? 'Updating…' : 'Update password'}
                  </button>
                </div>
              </form>
              </div>

              {/* MFA section */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="mb-3 text-sm font-semibold text-slate-700">Multi-Factor Authentication</h4>
                {mfaEnabled ? (
                  <div className="space-y-3">
                    <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      MFA is enabled for your account.
                    </p>
                    {!showMfaDisableForm ? (
                      <button
                        type="button"
                        onClick={() => setShowMfaDisableForm(true)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition"
                      >
                        Disable MFA
                      </button>
                    ) : (
                      <div className="space-y-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-sm text-red-800 font-medium">Enter your password to disable MFA</p>
                        <div className="flex gap-2 flex-wrap">
                          <input
                            type="password"
                            value={mfaDisablePassword}
                            onChange={(e) => setMfaDisablePassword(e.target.value)}
                            placeholder="Your password"
                            className="flex-1 min-w-[140px] rounded-xl border border-red-200 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          />
                          <button
                            type="button"
                            onClick={handleDisableMfa}
                            disabled={mfaDisableLoading}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            {mfaDisableLoading ? 'Disabling…' : 'Disable'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowMfaDisableForm(false); setMfaDisablePassword(''); setMfaMessage(''); }}
                            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {mfaMessage && <p className={`text-sm ${mfaMessage.includes('Success') ? 'text-emerald-600' : 'text-red-600'}`}>{mfaMessage}</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">Protect your account with 2-step verification.</p>
                    {!mfaQrCode ? (
                      <button
                        type="button"
                        onClick={startMfaSetup}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition"
                      >
                        Enable MFA
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl inline-block border border-slate-200">
                          <img src={mfaQrCode} alt="MFA QR Code" className="w-32 h-32" />
                        </div>
                        {mfaSecret && (
                          <p className="text-xs text-slate-500">
                            Secret: <span className="font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">{mfaSecret}</span>
                          </p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <input
                            type="text"
                            value={mfaToken}
                            onChange={(e) => setMfaToken(e.target.value)}
                            placeholder="6-digit code"
                            maxLength={8}
                            className="flex-1 min-w-[100px] rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                          />
                          <button
                            type="button"
                            onClick={verifyMfaSetup}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                    {mfaMessage && <p className={`text-sm ${mfaMessage.toLowerCase().includes('success') || mfaMessage.toLowerCase().includes('enabled') ? 'text-emerald-600' : 'text-red-600'}`}>{mfaMessage}</p>}
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TeamPage

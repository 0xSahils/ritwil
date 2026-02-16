import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CalculationService from '../utils/calculationService'
import { apiRequest } from '../api/client'

const TAB_IDS = ['overview', 'placements', 'profile']
const TAB_LABELS = { overview: 'Overview', placements: 'Placements', profile: 'Profile' }

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 * i },
  }),
  exit: { opacity: 0 },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

function StatCard({ label, value, sub, icon, highlighted }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`group relative overflow-hidden rounded-2xl p-6 shadow-sm transition-all duration-300 ${
        highlighted
          ? 'border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white hover:shadow-lg hover:shadow-emerald-500/15'
          : 'border border-slate-200/80 bg-white hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10'
      }`}
    >
      <div className={`absolute right-4 top-4 rounded-xl p-2.5 transition-colors ${
        highlighted ? 'bg-emerald-500/15 text-emerald-600 group-hover:bg-emerald-500/25' : 'bg-violet-500/10 text-violet-600 group-hover:bg-violet-500/20'
      }`}>
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value ?? '–'}</p>
      {sub != null && sub !== '' && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
          {highlighted && (
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {sub}
        </p>
      )}
    </motion.div>
  )
}

function ProgressCard({ title, label, current, total, percent }) {
  const rawPercent = Number(percent) || 0
  const pct = Math.min(100, Math.max(0, rawPercent))
  const exceeded = rawPercent >= 100 && rawPercent < Infinity
  const displayPercent = rawPercent > 100 ? 100 : rawPercent
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ boxShadow: exceeded ? '0 20px 40px -12px rgba(16, 185, 129, 0.12)' : '0 20px 40px -12px rgba(139, 92, 246, 0.12)' }}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">{title}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-800">
            {current} <span className="font-normal text-slate-400">/</span> {total}
          </p>
        </div>
        {exceeded && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8v8m-8 0h8" />
            </svg>
            Target exceeded
          </span>
        )}
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${exceeded ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, displayPercent)}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-2.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">
          {exceeded ? (
            <span className="font-semibold text-emerald-600">{rawPercent.toFixed(0)}% of target</span>
          ) : (
            `${pct.toFixed(1)}% complete`
          )}
        </span>
        {exceeded && rawPercent > 100 && (
          <span className="text-xs font-medium text-emerald-600">+{Math.round(rawPercent - 100)}% over</span>
        )}
      </p>
    </motion.div>
  )
}

export default function L4DashboardView({
  employeeData,
  currentPlacements,
  formatPlacementDate,
  personalSheetData,
  teamSheetData,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [placementSearch, setPlacementSearch] = useState('')
  const [placementFilterBilling, setPlacementFilterBilling] = useState('')
  const [placementFilterCollection, setPlacementFilterCollection] = useState('')
  const [placementFilterType, setPlacementFilterType] = useState('')
  const [placementFilterYear, setPlacementFilterYear] = useState('')
  const [placementSortBy, setPlacementSortBy] = useState('')
  const [placementSortDir, setPlacementSortDir] = useState('asc')

  const togglePlacementSort = (column) => {
    if (placementSortBy === column) {
      setPlacementSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setPlacementSortBy(column)
      setPlacementSortDir('asc')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    const { oldPassword, newPassword, confirmPassword } = passwordForm
    
    // Validate old password
    if (!oldPassword || oldPassword.trim() === '') {
      setPasswordError('Please enter your current password')
      return
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    
    // Check if old and new passwords are different
    if (oldPassword === newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }
    
    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    setPasswordLoading(true)
    try {
      const res = await apiRequest(`/users/${employeeData?.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          oldPassword: oldPassword,
          password: newPassword 
        }),
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

  // L4 only has personal placements; always use personal summary
  const activeSummary = personalSheetData?.summary
  const incentivePaidInr =
    activeSummary?.totalIncentivePaidInr != null
      ? Number(activeSummary.totalIncentivePaidInr)
      : null
  const incentiveEarnedNum =
    activeSummary?.totalIncentiveInr != null
      ? Number(activeSummary.totalIncentiveInr)
      : (employeeData?.placements || []).reduce((s, p) => {
          const str = (p.incentiveAmountINR || '').toString().replace(/[^0-9.-]+/g, '')
          return s + (Number(str) || 0)
        }, 0)
  const incentivePaidNum = incentivePaidInr ?? 0
  const incentivePendingNum = Math.max(0, incentiveEarnedNum - incentivePaidNum)

  // When sheet has placement target/done (e.g. Vantedge), use them and display as revenue/dollars
  const hasPlacementSheetData =
    activeSummary &&
    (activeSummary.yearlyPlacementTarget != null || activeSummary.placementDone != null)
  const sheetPlacementTarget = hasPlacementSheetData
    ? Number(activeSummary.yearlyPlacementTarget) || 0
    : null
  const sheetPlacementDone = hasPlacementSheetData && activeSummary.placementDone != null
    ? Number(activeSummary.placementDone)
    : null

  // Check if this is Vantedge team L4 - only these should show dollar signs for placements
  const isVantedgeL4 = employeeData?.teamName && 
    employeeData.teamName.toLowerCase().includes('vantedge') && 
    employeeData?.level === 'L4'

  const isRevenueTarget = employeeData?.targetType === 'REVENUE'
  const targetValue =
    hasPlacementSheetData && (sheetPlacementTarget > 0 || sheetPlacementDone != null)
      ? sheetPlacementTarget
      : isRevenueTarget
        ? employeeData?.yearlyRevenueTarget
        : employeeData?.yearlyPlacementTarget
  const achievedValue =
    hasPlacementSheetData && sheetPlacementDone != null
      ? sheetPlacementDone
      : isRevenueTarget
        ? employeeData?.rawRevenueGenerated
        : employeeData?.rawPlacementsCount
  
  // Format as currency ($) only for:
  // 1. Revenue targets (always show $)
  // 2. Vantedge L4s with placement sheet data (show $)
  // Otherwise, show plain numbers for placements
  const shouldFormatAsCurrency = isRevenueTarget || (isVantedgeL4 && hasPlacementSheetData)
  
  const targetDisplay =
    shouldFormatAsCurrency
      ? CalculationService.formatCurrency(targetValue || 0)
      : String(targetValue || 0)
  const achievedDisplay =
    shouldFormatAsCurrency
      ? CalculationService.formatCurrency(achievedValue ?? 0)
      : String(achievedValue ?? 0)
  const percent =
    hasPlacementSheetData && (activeSummary.placementAchPercent != null || activeSummary.targetAchievedPercent != null)
      ? Number(activeSummary.placementAchPercent ?? activeSummary.targetAchievedPercent) || 0
      : targetValue > 0
        ? ((achievedValue || 0) / targetValue) * 100
        : 0

  const slabInfo = employeeData?.slabQualified
    ? CalculationService.getSlabFromIncentivePercentage(
        employeeData.slabQualified,
        employeeData.teamName,
        employeeData.level
      )
    : null

  // Filter options: Billing & Type from DB enums; Collection & Year from data
  const PLACEMENT_BILLING_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'BILLED', label: 'Billed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'HOLD', label: 'Hold' },
  ]
  const PLACEMENT_TYPE_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'PERMANENT', label: 'Permanent' },
    { value: 'CONTRACT', label: 'Contract' },
  ]

  const placementUniqueValues = useMemo(() => {
    const list = currentPlacements || []
    const collection = [...new Set(list.map((p) => String(p.collectionStatus || '').trim()).filter(Boolean))].sort()
    const years = [...new Set(list.map((p) => (p.placementYear != null ? String(p.placementYear) : p.doj ? String(new Date(p.doj).getFullYear()) : '')).filter(Boolean))].sort((a, b) => Number(b) - Number(a))
    return { collection, years }
  }, [currentPlacements])

  const filteredPlacements = useMemo(() => {
    let list = currentPlacements || []
    const q = (placementSearch || '').toLowerCase().trim()
    if (q) {
      list = list.filter(
        (p) =>
          (p.candidateName || '').toLowerCase().includes(q) ||
          (p.client || '').toLowerCase().includes(q) ||
          (p.plcId || '').toLowerCase().includes(q)
      )
    }
    if (placementFilterBilling) {
      const v = placementFilterBilling.toUpperCase()
      list = list.filter((p) => {
        const b = (p.billingStatus || '').toUpperCase()
        if (v === 'BILLED') return b === 'BILLED' || b === 'DONE'
        return b === v
      })
    }
    if (placementFilterCollection) {
      list = list.filter(
        (p) => String(p.collectionStatus || '').toLowerCase() === placementFilterCollection.toLowerCase()
      )
    }
    if (placementFilterType) {
      list = list.filter((p) => {
        const t = String(p.placementType || '').toUpperCase()
        if (placementFilterType === 'PERMANENT') return t === 'PERMANENT' || (t && t.includes('PERMANENT')) || (t && t.includes('FTE'))
        if (placementFilterType === 'CONTRACT') return t === 'CONTRACT' || (t && t.includes('CONTRACT'))
        return t === placementFilterType
      })
    }
    if (placementFilterYear) {
      list = list.filter(
        (p) =>
          String(p.placementYear) === placementFilterYear ||
          (p.doj && String(new Date(p.doj).getFullYear()) === placementFilterYear)
      )
    }
    return list
  }, [currentPlacements, placementSearch, placementFilterBilling, placementFilterCollection, placementFilterType, placementFilterYear])

  const sortedPlacements = useMemo(() => {
    const list = [...filteredPlacements]
    if (!placementSortBy) return list
    const dir = placementSortDir === 'asc' ? 1 : -1
    list.sort((a, b) => {
      if (placementSortBy === 'candidate') {
        const na = (a.candidateName || '').toLowerCase()
        const nb = (b.candidateName || '').toLowerCase()
        return dir * (na < nb ? -1 : na > nb ? 1 : 0)
      }
      if (placementSortBy === 'revenue') {
        const ra = Number(a.totalRevenueGenerated ?? a.revenueUsd ?? a.revenue ?? 0)
        const rb = Number(b.totalRevenueGenerated ?? b.revenueUsd ?? b.revenue ?? 0)
        return dir * (ra - rb)
      }
      if (placementSortBy === 'incentive') {
        const ia = Number(a.incentiveInr ?? a.incentiveAmountInr ?? 0)
        const ib = Number(b.incentiveInr ?? b.incentiveAmountInr ?? 0)
        return dir * (ia - ib)
      }
      if (placementSortBy === 'placementYear') {
        const ya = a.placementYear != null ? Number(a.placementYear) : (a.doj ? new Date(a.doj).getFullYear() : 0)
        const yb = b.placementYear != null ? Number(b.placementYear) : (b.doj ? new Date(b.doj).getFullYear() : 0)
        return dir * (ya - yb)
      }
      return 0
    })
    return list
  }, [filteredPlacements, placementSortBy, placementSortDir])

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'chart' },
    { id: 'placements', label: 'Placements', icon: 'list' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ]
  const recentPlacements = (currentPlacements || []).slice(0, 5)
  const totalIncentive = incentiveEarnedNum || 1
  const earnedPct = Math.min(100, totalIncentive > 0 ? (incentiveEarnedNum / totalIncentive) * 100 : 0)
  const paidPct = Math.min(100 - earnedPct, totalIncentive > 0 ? (incentivePaidNum / totalIncentive) * 100 : 0)
  const pendingPct = Math.max(0, 100 - earnedPct - paidPct)
  const degEarned = earnedPct * 3.6
  const degPaid = (earnedPct + paidPct) * 3.6

  return (
    <div className="flex min-h-screen bg-slate-100/80">
      {/* Left sidebar - Financial Analytics style */}
      <motion.aside
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 z-30 flex w-20 flex-col border-r border-slate-200/80 bg-slate-800"
      >
        <div className="flex h-16 items-center justify-center border-b border-slate-700/80">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500 text-white">
            <span className="text-sm font-bold">R</span>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 text-center transition-colors ${
                activeTab === item.id
                  ? 'bg-violet-500/90 text-white'
                  : 'text-slate-400 hover:bg-slate-700/80 hover:text-white'
              }`}
              title={item.label}
            >
              {item.icon === 'chart' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              {item.icon === 'list' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )}
              {item.icon === 'currency' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {item.icon === 'user' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-700/80 p-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex w-full flex-col items-center gap-1 rounded-xl py-3 text-slate-400 transition-colors hover:bg-slate-700/80 hover:text-white"
            title="Settings"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col pl-20">
        {/* Top bar - title, search, export, user */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm"
        >
          <h1 className="text-xl font-bold text-slate-900">
            {activeTab === 'overview' && 'Recruitment Analytics'}
            {activeTab === 'placements' && 'Placements'}
            {activeTab === 'profile' && 'Profile'}
          </h1>
          <div className="flex items-center gap-3">
            {/* {activeTab === 'placements' && (
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Export
              </button>
            )} */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 pl-2 pr-4 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500 text-sm font-bold text-white">
                {(employeeData?.recruiterName || 'U').charAt(0)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">{employeeData?.recruiterName ?? 'User'}</p>
                <p className="text-xs text-slate-500">{employeeData?.teamName ?? ''}</p>
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Log out
              </button>
            )}
          </div>
        </motion.header>

      <main className="flex-1 p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.section
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8"
            >
              {/* Welcome Message - Premium Redesign */}
              <motion.div
                variants={itemVariants}
                className="group relative mb-8 overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/50 to-white p-6 shadow-sm transition-all duration-500 hover:border-violet-200/60 hover:shadow-lg sm:p-8"
              >
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Subtle pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgb(99,102,241)_1px,transparent_0)] bg-[length:24px_24px]" />
                </div>

                <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    {/* Avatar/Icon Circle */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.2, 
                        type: "spring", 
                        stiffness: 200,
                        damping: 15 
                      }}
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg ring-4 ring-violet-100 sm:h-16 sm:w-16"
                    >
                      <svg className="h-7 w-7 text-white sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </motion.div>

                    <div className="flex-1">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                          Welcome back,
                        </span>
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.4, type: "spring" }}
                          className="inline-block bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl"
                        >
                          {employeeData?.recruiterName || 'User'}
                        </motion.span>
                      </motion.div>
                      
                      {employeeData?.teamName && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="mt-2 flex items-center gap-2"
                        >
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-lg font-semibold text-slate-700">
                            {employeeData.teamName}
                          </span>
                          <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.7, type: "spring" }}
                            className="ml-2 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700"
                          >
                            Team
                          </motion.span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Decorative element */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
                    className="hidden shrink-0 sm:block"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100">
                      <svg className="h-6 w-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Hero performance block - Premium Redesign */}
              <motion.div
                variants={itemVariants}
                className="group relative overflow-hidden rounded-3xl p-5 shadow-2xl transition-all duration-500 sm:p-6"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
                  backgroundSize: '200% 200%',
                }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Animated gradient overlay */}
                <motion.div
                  className="absolute inset-0 opacity-90"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'linear',
                  }}
                  style={{
                    background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(255,255,255,0.25), transparent)',
                  }}
                />
                
                {/* Floating orbs for depth */}
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
                <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
                <div className="absolute right-1/4 top-1/4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-xs font-semibold uppercase tracking-[0.15em] text-white/90 sm:text-sm"
                    >
                      {isRevenueTarget ? 'Revenue' : 'Placements'} this period
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
                      className="text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl"
                    >
                      {achievedDisplay}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-lg font-medium text-white/95 sm:text-xl"
                    >
                      of {targetDisplay} target
                    </motion.p>
                    {(percent >= 100 && percent < Infinity) && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/25 px-4 py-2 text-xs font-bold text-white backdrop-blur-md shadow-lg ring-2 ring-white/30 sm:text-sm sm:px-5 sm:py-2.5"
                      >
                        <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {percent.toFixed(0)}% of target
                      </motion.p>
                    )}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xl ring-2 ring-white/30 sm:h-24 sm:w-24"
                  >
                    <svg className="h-12 w-12 text-white drop-shadow-lg sm:h-14 sm:w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isRevenueTarget ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      )}
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* KPI grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  label={isRevenueTarget ? 'Target revenue' : 'Target placements'}
                  value={targetDisplay}
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
                <StatCard
                  highlighted={percent >= 100 && percent < Infinity}
                  label={isRevenueTarget ? 'Revenue generated' : 'Placements done'}
                  value={achievedDisplay}
                  sub={
                    isRevenueTarget
                      ? (employeeData?.revenueGeneratedPercentage ? `${employeeData.revenueGeneratedPercentage} of target` : null)
                      : (employeeData?.targetAchieved ? `${employeeData.targetAchieved} of target` : null)
                  }
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8v8m-8 0h8" />
                    </svg>
                  }
                />
                <StatCard
                  label="Incentive earned"
                  value={
                    employeeData?.incentiveINR ??
                    (incentiveEarnedNum > 0 ? CalculationService.formatCurrency(incentiveEarnedNum, 'INR') : '–')
                  }
                  icon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Progress & Slab */}
              <div className="grid gap-6 sm:grid-cols-2">
                <ProgressCard
                  title={isRevenueTarget ? 'Revenue progress' : 'Placements progress'}
                  label={isRevenueTarget ? 'Generated' : 'Completed'}
                  current={achievedDisplay}
                  total={targetDisplay}
                  percent={percent}
                />
                {/* Current slab — compact card with icon */}
                <motion.div
                  variants={itemVariants}
                  className="flex self-start gap-4 rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-50 to-indigo-50/80 p-4 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">Current slab</p>
                    <p className="mt-0.5 text-xl font-bold text-violet-900">{employeeData?.slabQualified != null ? CalculationService.formatSlabAsPercentage(employeeData.slabQualified) : '–'}</p>
                    <p className="mt-1 text-xs text-violet-600/80">Incentive tier</p>
                  </div>
                </motion.div>
              </div>

              {/* Second row: Health overview + Incentive breakdown */}
              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div
                  variants={itemVariants}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Performance overview</h3>
                  <p className="mt-4 text-5xl font-bold text-emerald-600">
                    {percent < Infinity ? `${Math.round(percent)}%` : '–'}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {isRevenueTarget ? 'Revenue' : 'Placements'} performance. {percent >= 100
                      ? `Target achieved at ${percent.toFixed(0)}%, reflecting strong performance this period.`
                      : `Currently at ${percent.toFixed(1)}% of target.`}
                  </p>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                >
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      </svg>
                    </span>
                    Incentive breakdown
                  </h3>
                  <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
                    <div className="relative h-32 w-32 shrink-0">
                      <div
                        className="absolute inset-0 rounded-full border-4 border-white shadow-inner"
                        style={{
                          background: (incentiveEarnedNum > 0 || incentivePaidNum > 0)
                            ? `conic-gradient(#10b981 0deg ${degEarned}deg, #34d399 ${degEarned}deg ${degPaid}deg, #a78bfa ${degPaid}deg 360deg)`
                            : 'conic-gradient(#e2e8f0 0deg 360deg)',
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-inner ring-2 ring-white">
                          <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          Earned
                        </span>
                        <span className="font-semibold text-slate-800">
                          {employeeData?.incentiveINR ?? (incentiveEarnedNum > 0 ? CalculationService.formatCurrency(incentiveEarnedNum, 'INR') : '–')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                          Paid
                        </span>
                        <span className="font-semibold text-slate-800">
                          {incentivePaidInr != null ? CalculationService.formatCurrency(incentivePaidInr, 'INR') : '–'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                          Pending
                        </span>
                        <span className="font-semibold text-slate-800">
                          {CalculationService.formatCurrency(incentivePendingNum, 'INR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Placements */}
              <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Recent placements</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('placements')}
                    className="text-sm font-semibold text-violet-600 hover:text-violet-700"
                  >
                    View all
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {recentPlacements.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Candidate</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Client</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">DOJ</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Revenue</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Incentive</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentPlacements.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-800">{p.candidateName ?? '–'}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{p.client ?? '–'}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{formatPlacementDate(p.doj)}</td>
                            <td className="px-4 py-3 text-right text-sm text-slate-700">
                              {typeof (p.totalRevenue ?? p.revenue) === 'string'
                                ? (p.totalRevenue ?? p.revenue)
                                : CalculationService.formatCurrency(p.totalRevenueGenerated ?? p.revenueUsd ?? p.revenue ?? 0)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-700">
                              {typeof p.incentiveAmountINR === 'string'
                                ? p.incentiveAmountINR
                                : CalculationService.formatCurrency(p.incentiveInr ?? p.incentiveAmountINR ?? 0, 'INR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-6 py-8 text-center text-sm text-slate-500">No placements yet</div>
                  )}
                </div>
              </motion.div>
            </motion.section>
          )}

          {activeTab === 'placements' && (
            <motion.section
              key="placements"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Placements</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {sortedPlacements.length === (currentPlacements?.length ?? 0) &&
                    !placementSearch &&
                    !placementFilterBilling &&
                    !placementFilterCollection &&
                    !placementFilterType &&
                    !placementFilterYear
                      ? 'All placements'
                      : `${sortedPlacements.length} placement${sortedPlacements.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="relative flex items-center">
                    <svg className="absolute left-3 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={placementSearch}
                      onChange={(e) => setPlacementSearch(e.target.value)}
                      placeholder="Search placements..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 sm:w-64"
                    />
                  </div>
                  <select
                    value={placementFilterBilling}
                    onChange={(e) => setPlacementFilterBilling(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    {PLACEMENT_BILLING_OPTIONS.map((o) => (
                      <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <select
                    value={placementFilterCollection}
                    onChange={(e) => setPlacementFilterCollection(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="">All</option>
                    {placementUniqueValues.collection.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <select
                    value={placementFilterType}
                    onChange={(e) => setPlacementFilterType(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    {PLACEMENT_TYPE_OPTIONS.map((o) => (
                      <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <select
                    value={placementFilterYear}
                    onChange={(e) => setPlacementFilterYear(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="">Year</option>
                    {placementUniqueValues.years.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <button
                            type="button"
                            onClick={() => togglePlacementSort('candidate')}
                            className="inline-flex items-center gap-1 font-semibold hover:text-violet-600"
                          >
                            Candidate
                            {placementSortBy === 'candidate' && (
                              <span className="text-violet-600">
                                {placementSortDir === 'asc' ? (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                )}
                              </span>
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <button
                            type="button"
                            onClick={() => togglePlacementSort('placementYear')}
                            className="inline-flex items-center gap-1 font-semibold hover:text-violet-600"
                          >
                            Placement year
                            {placementSortBy === 'placementYear' && (
                              <span className="text-violet-600">
                                {placementSortDir === 'asc' ? (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                )}
                              </span>
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          DOJ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          DOQ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          PLC ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Billing status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Collection status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Total billed hours
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <button
                            type="button"
                            onClick={() => togglePlacementSort('revenue')}
                            className="inline-flex items-center gap-1 font-semibold hover:text-violet-600"
                          >
                            Revenue
                            {placementSortBy === 'revenue' && (
                              <span className="text-violet-600">
                                {placementSortDir === 'asc' ? (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                )}
                              </span>
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                          <button
                            type="button"
                            onClick={() => togglePlacementSort('incentive')}
                            className="inline-flex items-center gap-1 font-semibold hover:text-violet-600"
                          >
                            Incentive
                            {placementSortBy === 'incentive' && (
                              <span className="text-violet-600">
                                {placementSortDir === 'asc' ? (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                )}
                              </span>
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Incentive paid
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedPlacements.map((placement, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(idx * 0.02, 0.2), duration: 0.25 }}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-4 py-4 text-sm font-medium text-slate-800">
                            {placement.candidateName ?? '–'}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.client ?? '–'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {placement.placementYear ?? '–'}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatPlacementDate(placement.doj)}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatPlacementDate(placement.doq)}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.plcId ?? '–'}</td>
                          <td className="px-4 py-4 text-sm">
                            {placement.placementType ? (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  (String(placement.placementType).toUpperCase().includes('PERMANENT') ||
                                    String(placement.placementType).toUpperCase().includes('FTE'))
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {placement.placementType}
                              </span>
                            ) : (
                              '–'
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {placement.billingStatus ? (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  (placement.billingStatus === 'BILLED' || placement.billingStatus === 'Done' || placement.billingStatus === 'Billed')
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : (placement.billingStatus === 'PENDING' || placement.billingStatus === 'Pending')
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {placement.billingStatus === 'BILLED' ? 'Billed' : placement.billingStatus === 'PENDING' ? 'Pending' : placement.billingStatus}
                              </span>
                            ) : (
                              '–'
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {placement.collectionStatus ? (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  (placement.collectionStatus === 'COLLECTED' || String(placement.collectionStatus).toLowerCase() === 'collected')
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : (placement.collectionStatus === 'PENDING' || String(placement.collectionStatus).toLowerCase() === 'pending')
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {placement.collectionStatus}
                              </span>
                            ) : (
                              '–'
                            )}
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-slate-600">
                            {placement.totalBilledHours != null && placement.totalBilledHours !== ''
                              ? String(placement.totalBilledHours ?? placement.billedHours ?? '–')
                              : '–'}
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-medium text-slate-700">
                            {typeof (placement.totalRevenue ?? placement.revenue) === 'string'
                              ? (placement.totalRevenue ?? placement.revenue)
                              : CalculationService.formatCurrency(
                                  placement.totalRevenueGenerated ?? placement.revenueUsd ?? placement.revenue ?? 0
                                )}
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-semibold text-emerald-700">
                            {typeof placement.incentiveAmountINR === 'string'
                              ? placement.incentiveAmountINR
                              : CalculationService.formatCurrency(
                                  placement.incentiveInr ?? placement.incentiveAmountINR ?? 0,
                                  'INR'
                                )}
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-slate-600">
                            {placement.incentivePaidInr != null && placement.incentivePaidInr !== ''
                              ? CalculationService.formatCurrency(Number(placement.incentivePaidInr), 'INR')
                              : '–'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {sortedPlacements.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                    <svg
                      className="mb-3 h-12 w-12 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <p className="font-medium">
                      {(currentPlacements?.length ?? 0) === 0 ? 'No placements yet' : 'No placements match filters'}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>
          )}


          {activeTab === 'profile' && (
            <motion.section
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-slate-800">Profile</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                    <svg className="h-4 w-4 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Basic information
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <dt className="text-sm font-medium text-slate-500">VB Code</dt>
                      <dd className="text-sm font-semibold text-slate-800">{employeeData?.loginVBCode ?? '–'}</dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <dt className="text-sm font-medium text-slate-500">Name</dt>
                      <dd className="text-sm font-semibold text-slate-800">{employeeData?.recruiterName ?? '–'}</dd>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <dt className="text-sm font-medium text-slate-500">Team lead</dt>
                      <dd className="text-sm font-semibold text-slate-800">{employeeData?.teamLead ?? '–'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-500">Team</dt>
                      <dd className="text-sm font-semibold text-slate-800">{employeeData?.teamName ?? '–'}</dd>
                    </div>
                  </dl>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                    <svg className="h-4 w-4 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-5.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Performance & level
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                      <dt className="text-sm font-medium text-slate-500">Slab qualified</dt>
                      <dd>
                        {employeeData?.slabQualified ? (
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                              slabInfo?.color ?? 'bg-violet-100 text-violet-800'
                            }`}
                          >
                            {CalculationService.formatSlabAsPercentage(employeeData.slabQualified)}
                          </span>
                        ) : (
                          '–'
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-slate-500">User level</dt>
                      <dd>
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Recruiter
                        </span>
                        {/* <p className="mt-1 text-xs text-slate-500">View-only access</p> */}
                      </dd>
                    </div>
                  </dl>
                </motion.div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
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
            onClick={() => !passwordLoading && setSettingsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Settings</h3>
                <button
                  type="button"
                  onClick={() => !passwordLoading && setSettingsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h4 className="mb-3 text-sm font-semibold text-slate-700">Change password</h4>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{passwordSuccess}</p>
                )}
                <div>
                  <label htmlFor="l4-old-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Current password
                  </label>
                  <input
                    id="l4-old-password"
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
                  <label htmlFor="l4-new-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    New password
                  </label>
                  <input
                    id="l4-new-password"
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
                  <label htmlFor="l4-confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirm password
                  </label>
                  <input
                    id="l4-confirm-password"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

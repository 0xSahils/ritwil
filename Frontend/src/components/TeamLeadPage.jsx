import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import CalculationService from '../utils/calculationService'
import { Skeleton } from './common/Skeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 * i },
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

const TeamLeadPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [teamLeadData, setTeamLeadData] = useState(null)
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedMembers, setExpandedMembers] = useState({})
  const [viewMode, setViewMode] = useState('personal') // 'personal' | 'team'
  const [personalSheetData, setPersonalSheetData] = useState(null)
  const [teamSheetData, setTeamSheetData] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const response = await apiRequest(`/dashboard/team-lead`)
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load team lead data')
        }

        const data = await response.json()

        // Recursive function to map members if needed, or just use data directly
        // The backend buildHierarchy already returns the correct structure.
        // We might want to ensure numbers are numbers.
        const mapMember = (m) => ({
            ...m,
            target: Number(m.target || 0),
            targetAchieved: Number(m.targetAchieved || 0),
            members: (m.members || []).map(mapMember)
        })

        const mappedMembers = (data.members || []).map(mapMember)

        const lead = {
          id: data.lead.id,
          name: data.lead.name,
          level: data.lead.level || 'L2',
          target: Number(data.lead.target || 0),
          targetAchieved: Number(data.lead.targetAchieved || 0),
          targetType: data.lead.targetType,
          totalRevenue: data.lead.totalRevenue,
          totalPlacements: data.lead.totalPlacements,
          members: mappedMembers,
        }

        const team = {
          id: data.team.id,
          name: data.team.name,
          color: data.team.color || 'blue',
          teamTarget: Number(data.team.teamTarget || 0),
          targetAchieved: Number(data.lead.targetAchieved || 0),
          teamLeads: [lead],
        }

        if (isMounted) {
          setTeamData(team)
          setTeamLeadData(lead)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Something went wrong')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [retryCount])

  // Load sheet-backed personal/team placements for this lead
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [personalRes, teamRes] = await Promise.all([
          apiRequest(`/dashboard/personal-placements`),
          apiRequest(`/dashboard/team-placements`),
        ])
        if (!cancelled) {
          if (personalRes.ok) {
            const p = await personalRes.json()
            setPersonalSheetData(p)
          } else {
            setPersonalSheetData(null)
          }
          if (teamRes.ok) {
            const t = await teamRes.json()
            setTeamSheetData(t)
          } else {
            setTeamSheetData(null)
          }
        }
      } catch {
        if (!cancelled) {
          setPersonalSheetData(null)
          setTeamSheetData(null)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleMember = (memberId) => {
    setExpandedMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }))
  }

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

  const handleLogout = () => {
    logout().finally(() => {
      navigate('/')
    })
  }

  const handleMemberClick = (member, lead, team, viewParam) => {
    const slug = (member.name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || member.id;
    
    // If viewParam is not provided, determine it based on role/level
    if (!viewParam) {
      const isLead = member.role === 'TEAM_LEAD' || (member.level && ['L2', 'L3'].includes(member.level.toUpperCase()));
      viewParam = isLead ? '?view=team' : '?view=personal';
    } else if (!viewParam.startsWith('?')) {
      viewParam = `?view=${viewParam}`;
    }

    navigate(`/employee/${slug}${viewParam}`, {
      state: {
        employeeId: member.id,
        employeeName: member.name,
        teamLead: lead.name,
        teamName: team.name,
        level: member.level,
      },
    })
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-12 w-56 rounded-xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50 px-8 py-6 max-w-md w-full text-center"
        >
          <p className="text-red-600 font-medium mb-4">{error || 'Something went wrong'}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => { setError(''); setLoading(true); setRetryCount(c => c + 1); }}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/20 transition-shadow"
          >
            Retry
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  // Ensure data exists before rendering
  if (!teamData || !teamLeadData) return null

  const colorClasses = getTeamColorClasses(teamData.color)
  const members = teamLeadData.members || []
  const isPlacementTeam = teamLeadData.targetType === 'PLACEMENTS'

  // Same labels as Super Admin / Super User outside card: Placement Target / Placements Done or Revenue Target / Revenue Achieved
  const targetLabel = isPlacementTeam ? 'Placement Target' : 'Revenue Target'
  const achievedLabel = isPlacementTeam ? 'Placements Done' : 'Revenue Achieved'

  // Prefer sheet summary for header when viewing that tab (so summary matches the table)
  const sheetSummary = viewMode === 'team' ? teamSheetData?.summary : personalSheetData?.summary
  const hasSheetSummary = !!sheetSummary

  const leadTarget = teamLeadData.target || members.reduce((sum, member) => sum + (Number(member.target) || 0), 0)
  const currentLeadData = {
    ...teamLeadData,
    target: leadTarget
  }

  // When Personal is selected but there's no personal sheet data, show 0 in header (don't use team totals)
  const usePersonalHeader = viewMode === 'personal' && !personalSheetData?.summary

  const displayTarget = usePersonalHeader
    ? 0
    : hasSheetSummary
      ? (isPlacementTeam ? (sheetSummary.yearlyPlacementTarget ?? leadTarget) : (sheetSummary.yearlyRevenueTarget ?? leadTarget))
      : leadTarget
  const formattedTeamTarget = isPlacementTeam
    ? String(displayTarget)
    : CalculationService.formatCurrency(Number(displayTarget) || 0)

  const achievedValue = usePersonalHeader
    ? 0
    : hasSheetSummary
      ? (isPlacementTeam ? (sheetSummary.placementDone ?? currentLeadData.totalPlacements ?? 0) : (Number(sheetSummary.totalRevenueGenerated) ?? currentLeadData.totalRevenue ?? 0))
      : (isPlacementTeam ? (currentLeadData.totalPlacements || 0) : (currentLeadData.totalRevenue || 0))
  const totalTarget = Number(displayTarget) || 1
  const sheetPct = sheetSummary && (sheetSummary.revenueTargetAchievedPercent != null || sheetSummary.placementAchPercent != null || sheetSummary.targetAchievedPercent != null)
  const achievementPercentage = usePersonalHeader
    ? 0
    : hasSheetSummary && sheetPct
      ? Math.round(Number(isPlacementTeam ? (sheetSummary.placementAchPercent ?? sheetSummary.targetAchievedPercent) : (sheetSummary.revenueTargetAchievedPercent ?? sheetSummary.targetAchievedPercent)) || 0)
      : Math.min(Math.round((achievedValue / totalTarget) * 100), 100)
 
   // Helper for Circular Progress
  const CircularProgress = ({ percentage, color = "text-green-500" }) => {
    const radius = 16
    const circumference = 2 * Math.PI * radius
    // Cap fill at 100% so circle stays full green; number still shows actual percentage
    const fillPercent = Math.min(percentage, 100)
    const strokeDashoffset = circumference - (fillPercent / 100) * circumference

    return (
      <div className="relative flex items-center justify-center w-12 h-12">
        <svg className="transform -rotate-90 w-12 h-12">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-slate-200"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            strokeOpacity={1}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-slate-700">{percentage}%</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-8">
        {/* Hero Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-800 via-slate-800 to-violet-900/90 p-6 md:p-8 shadow-xl shadow-slate-900/10"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <motion.div
                variants={itemVariants}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner"
              >
                <svg className="h-8 w-8 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <div>
                <motion.div variants={itemVariants} className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {teamLeadData.level || 'L2'} · Team Lead
                </motion.div>
                <motion.h1 variants={itemVariants} className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-0.5">
                  {teamLeadData.name}
                </motion.h1>
                <motion.p variants={itemVariants} className="text-slate-400 font-medium text-sm">{teamData.name}</motion.p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm"
              >
                <svg className="h-4 w-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-sm font-medium text-slate-200">{members.filter(m => m.name !== 'pass through').length} Members</span>
              </motion.div>

              {(teamLeadData.level === 'L2' || teamLeadData.level === 'L3') && (
                <motion.div variants={itemVariants} className="rounded-xl border border-white/10 bg-white/5 p-1 flex items-center gap-0.5 backdrop-blur-sm">
                  <button
                    onClick={() => setViewMode('personal')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === 'personal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Personal
                  </button>
                  <button
                    onClick={() => setViewMode('team')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      viewMode === 'team' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Team
                  </button>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                <span className="text-xs text-slate-400 mr-2">{targetLabel}:</span>
                <span className="text-sm font-bold text-white">{formattedTeamTarget}</span>
              </motion.div>
              <motion.div variants={itemVariants} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                <span className="text-xs text-slate-400 mr-2">{achievedLabel}:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {isPlacementTeam ? achievedValue : CalculationService.formatCurrency(achievedValue)}
                </span>
                <span className="text-xs text-slate-400 ml-1">({achievementPercentage}%)</span>
              </motion.div>
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 hover:shadow-lg hover:shadow-slate-500/10 transition-all"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Placements (Sheet) Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              {viewMode === 'personal' ? 'My Personal Placements (Sheet)' : 'My Team Placements (Sheet)'}
            </h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Data below is read directly from the uploaded Excel sheet. No additional calculations are done in the app.
          </p>
          {hasSheetSummary && sheetSummary && (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-5 bg-slate-50/80 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm"
            >
              {!isPlacementTeam && (
                <>
                  <div>
                    <span className="text-slate-500 block">Yearly Revenue Target</span>
                    <span className="font-semibold text-slate-800">{sheetSummary.yearlyRevenueTarget != null ? CalculationService.formatCurrency(Number(sheetSummary.yearlyRevenueTarget)) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Revenue Generated</span>
                    <span className="font-semibold text-slate-800">{sheetSummary.totalRevenueGenerated != null ? CalculationService.formatCurrency(Number(sheetSummary.totalRevenueGenerated)) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Achieved %</span>
                    <span className="font-semibold text-slate-800">{sheetSummary.revenueTargetAchievedPercent != null ? `${sheetSummary.revenueTargetAchievedPercent}%` : '-'}</span>
                  </div>
                </>
              )}
              {isPlacementTeam && (
                <>
                  <div>
                    <span className="text-slate-500 block">Yearly Placement Target</span>
                    <span className="font-semibold text-slate-800">{sheetSummary.yearlyPlacementTarget != null ? String(sheetSummary.yearlyPlacementTarget) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Placements Done</span>
                    <span className="font-semibold text-slate-800">{sheetSummary.placementDone != null ? String(sheetSummary.placementDone) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Achieved %</span>
                    <span className="font-semibold text-slate-800">{sheetSummary.placementAchPercent != null ? `${sheetSummary.placementAchPercent}%` : '-'}</span>
                  </div>
                </>
              )}
              <div>
                <span className="text-slate-500 block">Total Revenue Generated (USD)</span>
                <span className="font-semibold text-slate-800">{sheetSummary.totalRevenueGenerated != null ? CalculationService.formatCurrency(Number(sheetSummary.totalRevenueGenerated)) : '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Slab Qualified</span>
                <span className="font-semibold text-slate-800">{sheetSummary.slabQualified ?? '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Incentive (INR)</span>
                <span className="font-semibold text-slate-800">{sheetSummary.totalIncentiveInr != null ? CalculationService.formatCurrency(Number(sheetSummary.totalIncentiveInr), 'INR') : '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Incentive Paid (INR)</span>
                <span className="font-semibold text-slate-800">{sheetSummary.totalIncentivePaidInr != null ? CalculationService.formatCurrency(Number(sheetSummary.totalIncentivePaidInr), 'INR') : '-'}</span>
              </div>
            </motion.div>
          )}
          <motion.div variants={itemVariants} className="overflow-hidden rounded-xl border border-slate-200/80">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  {viewMode === 'personal' ? (
                    <tr>
                      <th className="px-4 py-3 text-left">Candidate Name</th>
                      <th className="px-4 py-3 text-left">Placement Year</th>
                      <th className="px-4 py-3 text-left">DOJ</th>
                      <th className="px-4 py-3 text-left">DOQ</th>
                      <th className="px-4 py-3 text-left">Client</th>
                      <th className="px-4 py-3 text-left">PLC ID</th>
                      <th className="px-4 py-3 text-left">Placement Type</th>
                      <th className="px-4 py-3 text-left">Billing Status</th>
                      <th className="px-4 py-3 text-left">Collection Status</th>
                      <th className="px-4 py-3 text-left">Total Billed Hours</th>
                      <th className="px-4 py-3 text-left">Revenue (USD)</th>
                      <th className="px-4 py-3 text-left">Incentive amount (INR)</th>
                      <th className="px-4 py-3 text-left">Incentive Paid (INR)</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3 text-left">Candidate Name</th>
                      <th className="px-4 py-3 text-left">Recruiter Name</th>
                      <th className="px-4 py-3 text-left">Split With</th>
                      <th className="px-4 py-3 text-left">Placement Year</th>
                      <th className="px-4 py-3 text-left">DOJ</th>
                      <th className="px-4 py-3 text-left">DOQ</th>
                      <th className="px-4 py-3 text-left">Client</th>
                      <th className="px-4 py-3 text-left">PLC ID</th>
                      <th className="px-4 py-3 text-left">Placement Type</th>
                      <th className="px-4 py-3 text-left">Billing Status</th>
                      <th className="px-4 py-3 text-left">Collection Status</th>
                      <th className="px-4 py-3 text-left">Total Billed Hours</th>
                      <th className="px-4 py-3 text-left">Revenue -Lead (USD)</th>
                      <th className="px-4 py-3 text-left">Incentive amount (INR)</th>
                      <th className="px-4 py-3 text-left">Incentive Paid (INR)</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewMode === 'personal'
                    ? (personalSheetData?.placements || []).map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2 text-slate-800">{p.candidateName}</td>
                          <td className="px-4 py-2 text-slate-600">{p.placementYear ?? '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.doj ? new Date(p.doj).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.doq ? new Date(p.doq).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.client}</td>
                          <td className="px-4 py-2 text-slate-600">{p.plcId}</td>
                          <td className="px-4 py-2 text-slate-600">{p.placementType}</td>
                          <td className="px-4 py-2 text-slate-600">{p.billingStatus}</td>
                          <td className="px-4 py-2 text-slate-600">{p.collectionStatus ?? '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.totalBilledHours ?? '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.revenueUsd}</td>
                          <td className="px-4 py-2 text-slate-600">{p.incentiveInr}</td>
                          <td className="px-4 py-2 text-slate-600">{p.incentivePaidInr ?? '-'}</td>
                        </tr>
                      ))
                    : (teamSheetData?.placements || []).map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2 text-slate-800">{p.candidateName}</td>
                          <td className="px-4 py-2 text-slate-600">{p.recruiterName ?? '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.splitWith ?? '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.placementYear ?? '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.doj ? new Date(p.doj).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.doq ? new Date(p.doq).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.client}</td>
                          <td className="px-4 py-2 text-slate-600">{p.plcId}</td>
                          <td className="px-4 py-2 text-slate-600">{p.placementType}</td>
                          <td className="px-4 py-2 text-slate-600">{p.billingStatus}</td>
                          <td className="px-4 py-2 text-slate-600">{p.collectionStatus ?? '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.totalBilledHours ?? '-'}</td>
                          <td className="px-4 py-2 text-slate-600">{p.revenueLeadUsd}</td>
                          <td className="px-4 py-2 text-slate-600">{p.incentiveInr}</td>
                          <td className="px-4 py-2 text-slate-600">{p.incentivePaidInr ?? '-'}</td>
                        </tr>
                      ))}
                  {((viewMode === 'personal'
                    ? personalSheetData?.placements
                    : teamSheetData?.placements) || []
                  ).length === 0 && (
                    <tr>
                      <td colSpan={viewMode === 'personal' ? 13 : 15} className="px-4 py-6 text-center text-slate-500">
                        No {viewMode === 'personal' ? 'personal' : 'team'} placements found from sheet for this year.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.section>

        {/* Team Members */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-slate-800">Team Members</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.filter(m => m.name !== 'pass through').map((member, idx) => {
                // Display by team target type: placement team -> placement target/done/%; revenue team -> revenue target/achieved/%
                const memberIsPlacement = isPlacementTeam || member.targetType === 'PLACEMENTS';
                const memberTarget = Number(member.target || 0);
                const memberAchieved = memberIsPlacement
                  ? (member.totalPlacements ?? member.placements ?? 0)
                  : (member.totalRevenue ?? member.revenue ?? 0);
                const memberPercentage = memberTarget > 0
                  ? Math.round((Number(memberAchieved) / memberTarget) * 100)
                  : (member.targetAchieved ?? 0);
                
                // Dynamic color based on percentage
               let progressColor = "text-red-500";
               if (memberPercentage >= 75) progressColor = "text-green-500";
               else if (memberPercentage >= 50) progressColor = "text-yellow-500";

               return (
                 <motion.div
                   key={member.id}
                   variants={itemVariants}
                   initial="hidden"
                   animate="visible"
                   transition={{ delay: idx * 0.06, type: 'spring', stiffness: 300, damping: 30 }}
                   whileHover={{ y: -2, boxShadow: '0 20px 40px -12px rgba(139, 92, 246, 0.15)' }}
                   whileTap={{ scale: 0.99 }}
                   onClick={() => {
                     const isLead = member.role === 'TEAM_LEAD' || (member.level && ['L2', 'L3'].includes(member.level.toUpperCase()));
                     handleMemberClick(member, teamLeadData, teamData, isLead ? 'team' : 'personal');
                   }}
                   className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-colors hover:border-violet-200/80"
                 >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-violet-500/10 group-hover:text-violet-600">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{member.name}</h3>
                        <p className="text-slate-500 text-sm font-medium">{member.level || 'L4'}</p>
                      </div>
                    </div>
                    <CircularProgress percentage={memberPercentage} color={progressColor} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">{memberIsPlacement ? 'Placement Target:' : 'Revenue Target:'}</span>
                      <span className="font-semibold text-slate-800">
                        {memberIsPlacement ? memberTarget : CalculationService.formatCurrency(memberTarget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">{memberIsPlacement ? 'Placements Done:' : 'Revenue Achieved:'}</span>
                      <span className={`font-semibold ${progressColor}`}>
                        {memberIsPlacement ? memberAchieved : CalculationService.formatCurrency(memberAchieved)}
                      </span>
                    </div>
                  </div>
                </motion.div>
               )
            })}
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}

export default TeamLeadPage

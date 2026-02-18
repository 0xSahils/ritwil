import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import CalculationService from '../utils/calculationService'
import { useEmployeeDetails, useUpdateVbid } from '../hooks/useEmployee'
import { Skeleton, CardSkeleton, TableRowSkeleton } from './common/Skeleton'
import L4DashboardView from './L4DashboardView'

const EmployeeDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { employeeId: stateEmployeeId } = location.state || {}

  const employeeIdToFetch = stateEmployeeId || params.id
  
  // Initialize viewMode from URL query param, default to 'personal'
  // For L4 users, always use 'personal' regardless of URL
  const initialViewMode = 'personal'
  const [viewMode, setViewMode] = useState(initialViewMode)

  // Sync viewMode state with URL (but ignore team view for L4 users)
  useEffect(() => {
    const view = searchParams.get('view')
    if (view && (view === 'personal' || view === 'team')) {
      // Only set viewMode if not L4 user, or if it's personal view
      // L4 users will be forced to personal in another useEffect
      setViewMode(view)
    }
  }, [searchParams])

  // Update URL when viewMode state changes internally (via toggle)
  // Prevent L4 users from switching to team view
  const handleToggleView = (mode) => {
    // Don't allow L4 users to switch to team view
    if (employeeData?.level?.toUpperCase() === 'L4' && mode === 'team') {
      return;
    }
    setViewMode(mode)
    setSearchParams(prev => {
      prev.set('view', mode)
      return prev
    }, { replace: true })
  }
  
  const { data: rawData, isLoading, error, refetch } = useEmployeeDetails(
    employeeIdToFetch,
    user?.role,
    user?.id
  )
  const isCuid = (v) => typeof v === 'string' && v.length >= 24 && /^c[a-z0-9]+$/i.test(v)
  const resolvedEmployeeId = rawData?.id ?? (isCuid(employeeIdToFetch) ? employeeIdToFetch : null)
  const updateVbidMutation = useUpdateVbid()

  const [isEditingVbid, setIsEditingVbid] = useState(false)
  const [vbidValue, setVbidValue] = useState('')
  const [openTooltip, setOpenTooltip] = useState(null)
  const tooltipRef = useRef(null)
 
  // Sheet-backed personal/team placements for this employee/lead
  const [personalSheetData, setPersonalSheetData] = useState(null);
  const [teamSheetData, setTeamSheetData] = useState(null);
 
  const formatPlacementDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    // Treat sentinel 1990-01-01 as blank (from 1/0/1990 or similar)
    if (d.getFullYear() === 1990 && d.getMonth() === 0 && d.getDate() === 1) {
      return '-';
    }
    return d.toLocaleDateString();
  };

  const employeeData = useMemo(() => {
    if (!rawData) return null

    const yearlyTarget = Number(rawData.yearlyTarget || 0)
    const revenueGenerated = Number(rawData.revenueGenerated || 0)
    const percentage = Number(rawData.percentage || 0)

    const placements = (rawData.placements || []).map((p) => ({
      candidateName: p.candidateName,
      candidateId: p.candidateId || '-',
      placementYear: p.placementYear || '-',
      plcId: p.plcId || '-',
      collectionStatus: p.collectionStatus || '-',
      doj: p.doj?.slice(0, 10),
      doq: p.doq ? p.doq.slice(0, 10) : '-',
      recruiter: p.recruiter || '-',
      client: p.clientName || p.client,
      sourcer: p.sourcer || '-',
      accountManager: p.accountManager || '-',
      teamLead: p.teamLead || '-',
      placementSharing: p.placementSharing || '-',
      placementCredit: p.placementCredit ? String(Number(p.placementCredit)) : '-',
      totalRevenue: p.totalRevenue ? CalculationService.formatCurrency(p.totalRevenue) : '-',
      revenue: p.revenue ? CalculationService.formatCurrency(p.revenue) : '-',
      revenueAsLead: p.revenueAsLead ? CalculationService.formatCurrency(p.revenueAsLead) : '-',
      placementType: p.placementType || '-', // Keep exact value from sheet
      billedHours: p.billedHours ? String(p.billedHours) : '',
      billingStatus: p.billingStatus === 'BILLED' ? 'Done' : p.billingStatus === 'PENDING' ? 'Pending' : p.billingStatus,
      incentivePayoutETA: p.incentivePayoutEta ? p.incentivePayoutEta.slice(0, 10) : '',
      incentiveAmountINR: CalculationService.formatCurrency(p.incentiveAmountInr, 'INR'),
      incentivePaidInr: p.incentivePaidInr,
      monthlyBilling: (p.monthlyBilling || []).map((mb) => ({
        month: mb.month,
        hours: mb.hours || 0,
        status: mb.status === 'BILLED' ? 'Billed' : 'Pending',
      })),
    }))

    // Sheet-backed summaries (if available). We do NOT recalculate totals here –
    // we only reuse the snapshot values that were already computed in the sheet.
    const personalSummary = personalSheetData?.summary;
    const teamSummary = teamSheetData?.summary;

    // Calculate fallback values only if no sheet summary available
    const totalPlacementIncentiveInr = placements.reduce((sum, p) => {
      const valStr = p.incentiveAmountINR ? String(p.incentiveAmountINR).replace(/[^0-9.-]+/g, "") : "0";
      return sum + (Number(valStr) || 0);
    }, 0);

    const calculatedIncentiveUsd = totalPlacementIncentiveInr / 80;
    const totalPlacementRevenue = (rawData.placements || []).reduce((sum, p) => {
       return sum + (Number(p.totalRevenue) || 0);
    }, 0);

    // Use sheet summary values when available. When in personal/team view but no sheet data, show 0 (do not use merged totals).
    const isTeamView = viewMode === 'team' && teamSheetData?.summary;
    const isPersonalView = viewMode === 'personal' && personalSheetData?.summary;
    const personalViewNoData = viewMode === 'personal' && !personalSheetData?.summary;
    const teamViewNoData = viewMode === 'team' && !teamSheetData?.summary;

    const activeSummary = isTeamView ? teamSheetData.summary : (isPersonalView ? personalSheetData.summary : null);

    // Revenue and placement targets: when in personal/team view with no sheet, show 0
    const profileRevenueTarget = Number(rawData.yearlyRevenueTarget ?? rawData.yearlyTarget ?? 0) || null;
    const revenueTarget = personalViewNoData || teamViewNoData
      ? 0
      : (isTeamView
          ? (profileRevenueTarget ?? activeSummary?.yearlyRevenueTarget ?? 0)
          : (isPersonalView
              ? (activeSummary?.yearlyRevenueTarget ?? rawData.yearlyRevenueTarget ?? 0)
              : (rawData.targetType === 'REVENUE' ? yearlyTarget : 0)));

    const placementTarget = personalViewNoData || teamViewNoData
      ? 0
      : (isTeamView
          ? (activeSummary?.yearlyPlacementTarget || 0)
          : (isPersonalView
              ? (activeSummary?.yearlyPlacementTarget || (rawData.targetType === 'PLACEMENTS' ? yearlyTarget : 0))
              : (rawData.targetType === 'PLACEMENTS' ? yearlyTarget : 0)));

    // Achieved values: when in personal/team view with no sheet data, show 0 (do not use merged dashboard totals)
    const achievedRevenue = personalViewNoData || teamViewNoData
      ? 0
      : (isTeamView
          ? (activeSummary?.revenueAch ?? activeSummary?.totalRevenueGenerated ?? 0)
          : (isPersonalView
              ? (activeSummary?.totalRevenueGenerated ?? 0)
              : revenueGenerated));

    const achievedPlacements = personalViewNoData || teamViewNoData
      ? 0
      : (isTeamView
          ? (activeSummary?.placementDone ?? 0)
          : (isPersonalView
              ? (activeSummary?.placementDone ?? rawData.placementsCount ?? placements.length)
              : (rawData.placementsCount ?? placements.length)));

    // Achievement percentages: 0 when no sheet data for this view; otherwise from summary or calculated
    const revenuePercent = personalViewNoData || teamViewNoData
      ? 0
      : (isTeamView && activeSummary?.revenueTargetAchievedPercent != null
          ? activeSummary.revenueTargetAchievedPercent
          : (isPersonalView && activeSummary?.revenueTargetAchievedPercent != null
              ? activeSummary.revenueTargetAchievedPercent
              : (revenueTarget > 0 ? (achievedRevenue / revenueTarget) * 100 : 0)));

    const placementPercent = personalViewNoData || teamViewNoData
      ? 0
      : (isTeamView && activeSummary?.placementAchPercent != null
          ? activeSummary.placementAchPercent
          : (isPersonalView && activeSummary?.targetAchievedPercent != null
              ? activeSummary.targetAchievedPercent
              : (placementTarget > 0 ? (achievedPlacements / placementTarget) * 100 : 0)));

    // Slab and incentives: when no sheet data for this view, show nothing; otherwise from summary or calculated
    const slab = personalViewNoData || teamViewNoData
      ? null
      : (isTeamView
          ? (activeSummary?.slabQualified ?? null)
          : (isPersonalView
              ? (activeSummary?.slabQualified ?? null)
              : (rawData.slabQualified ?? null)));

    const incentiveInr = personalViewNoData || teamViewNoData
      ? null
      : (isTeamView
          ? (activeSummary?.totalIncentiveInr ?? null)
          : (isPersonalView
              ? (activeSummary?.totalIncentiveInr ?? null)
              : totalPlacementIncentiveInr));
    const incentiveInrNum = incentiveInr ?? 0;

    return {
      id: rawData.id,
      loginVBCode: rawData.vbid || 'VB' + String(rawData.id).slice(-3),
      recruiterName: rawData.name || 'Employee Name',
      teamLead: rawData.teamLead || 'Team Lead Name',
      teamName: rawData.team || 'Team Name',
      level: rawData.level,
      targetType: rawData.targetType || 'REVENUE',
      individualSynopsis: 'Active Recruiter',
      // Targets
      yearlyTarget: rawData.targetType === 'PLACEMENTS' ? String(placementTarget) : CalculationService.formatCurrency(revenueTarget),
      yearlyRevenueTarget: revenueTarget,
      yearlyPlacementTarget: placementTarget,
      // Achieved values (from backend summary snapshot when sheet summary exists)
      rawRevenueGenerated: achievedRevenue,
      rawPlacementsCount: achievedPlacements,
      revenueGenerated: (personalViewNoData || teamViewNoData)
        ? CalculationService.formatCurrency(0)
        : ((isTeamView || isPersonalView) && achievedRevenue === 0 && activeSummary?.totalRevenueGenerated == null
            ? null
            : CalculationService.formatCurrency(achievedRevenue)),
      placementsAchieved: String(achievedPlacements),
      // Percentages
      targetAchieved: CalculationService.formatPercentage(placementPercent),
      rawPercentage: placementPercent,
      revenueGeneratedPercentage: CalculationService.formatPercentage(revenuePercent),
      // Other: when no sheet data for this view, do not use merged-list total
      calculatedRevenueGenerated: (personalViewNoData || teamViewNoData)
        ? CalculationService.formatCurrency(0)
        : CalculationService.formatCurrency(totalPlacementRevenue),
      totalRevenue: rawData.targetType === 'PLACEMENTS' ? String(placementTarget) : CalculationService.formatCurrency(revenueTarget),
      targetPlacements: String(placementTarget),
      slabQualified: slab,
      slabComment: rawData.slabComment ?? null,
      incentiveUSD: incentiveInr != null ? CalculationService.formatCurrency(incentiveInrNum / 80) : null,
      incentiveINR: incentiveInr != null ? CalculationService.formatCurrency(incentiveInrNum, 'INR') : null,
      placements,
      // Summary data for dual-target detection
      teamSummary,
      personalSummary,
      // Profile target (for team view: prefer over wrong sheet value)
      yearlyRevenueTargetFromProfile: Number(rawData.yearlyRevenueTarget ?? rawData.yearlyTarget ?? 0) || null,
    }
  }, [rawData, viewMode, personalSheetData, teamSheetData])

  const handleLogout = () => {
    navigate('/')
  }

  const navigateToProfileEdit = () => {
    navigate(`/employee/${params.id}/edit`);
  };

  const isRevenueTarget = employeeData?.targetType === 'REVENUE'
  
  // Vantage detection: For Vantage team, "Placement Target" and "Placements Done" are actually revenue values
  const isVantageTeam = employeeData?.teamName && employeeData.teamName.toLowerCase().includes('vant')
  const isVantagePersonalView = isVantageTeam && viewMode === 'personal' && employeeData?.personalSummary
  
  // Dual-target detection: Check if we have both revenue and placement targets in team summary
  const isDualTarget = viewMode === 'team' && 
                       employeeData?.teamSummary?.yearlyRevenueTarget != null && 
                       employeeData?.teamSummary?.yearlyPlacementTarget != null;

  const dualRevenueTarget = employeeData?.yearlyRevenueTarget || 0;
  const dualPlacementTarget = employeeData?.yearlyPlacementTarget || 0;
  
  // Use percentages from sheet summary if available, otherwise calculate
  const dualRevenuePercent = employeeData?.teamSummary?.revenueTargetAchievedPercent != null
    ? employeeData.teamSummary.revenueTargetAchievedPercent
    : (dualRevenueTarget > 0 ? (employeeData?.rawRevenueGenerated / dualRevenueTarget) * 100 : 0);
  
  const dualPlacementPercent = employeeData?.teamSummary?.placementAchPercent != null
    ? employeeData.teamSummary.placementAchPercent
    : (dualPlacementTarget > 0 ? (employeeData?.rawPlacementsCount / dualPlacementTarget) * 100 : 0);

  const showMargin = user?.role === 'S1_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEAM_LEAD';
  const isVantageL4 = employeeData?.teamName && employeeData.teamName.toLowerCase().includes('vant') && 
                      ['L2', 'L3', 'L4'].includes(employeeData?.level?.toUpperCase());
  
  // Check if employee is L4 level - L4 users only have personal placements
  const isL4User = employeeData?.level?.toUpperCase() === 'L4';
  
  // Show toggle if user has personal and/or team data (so profile can switch views; one may be empty)
  // BUT hide toggle for L4 users since they only have personal placements
  const hasPersonalData = !!(personalSheetData?.placements?.length || personalSheetData?.summary);
  const hasTeamData = !!(teamSheetData?.placements?.length || teamSheetData?.summary);
  const canToggleView = !isL4User && (hasPersonalData || hasTeamData);

  // Force L4 users to always use personal view
  useEffect(() => {
    if (employeeData && isL4User && viewMode !== 'personal') {
      setViewMode('personal');
      setSearchParams(prev => {
        prev.set('view', 'personal');
        return prev;
      }, { replace: true });
    }
  }, [employeeData, isL4User, viewMode, setSearchParams]);

  // Auto-switch viewMode if only one type of data is available and no explicit view is set in URL
  useEffect(() => {
    if (!searchParams.get('view')) {
      if (hasTeamData && !hasPersonalData && !isL4User) {
        setViewMode('team');
      } else if (hasPersonalData && !hasTeamData) {
        setViewMode('personal');
      } else if (isL4User) {
        setViewMode('personal');
      }
    }
  }, [hasPersonalData, hasTeamData, searchParams, isL4User]);

  // Explicit data separation: personal view shows only personal sheet data; team view only team sheet data.
  // When there is no personal (or team) sheet, show empty list — do not fall back to merged dashboard placements.
  const currentPlacements = useMemo(() => {
    if (viewMode === 'team' && hasTeamData) {
      return teamSheetData?.placements || [];
    }
    if (viewMode === 'personal' && hasPersonalData) {
      return personalSheetData?.placements || [];
    }
    // No sheet data for this view: show empty (e.g. L2 personal view with no personal sheet)
    return [];
  }, [viewMode, hasTeamData, hasPersonalData, teamSheetData, personalSheetData]);

  useEffect(() => {
    if (!resolvedEmployeeId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const [personalRes, teamRes] = await Promise.all([
          apiRequest(`/dashboard/personal-placements?userId=${resolvedEmployeeId}`),
          apiRequest(`/dashboard/team-placements?leadId=${resolvedEmployeeId}`),
        ]);
        if (!cancelled) {
          if (personalRes.ok) {
            const p = await personalRes.json();
            setPersonalSheetData(p);
          } else {
            setPersonalSheetData(null);
          }
          if (teamRes.ok) {
            const t = await teamRes.json();
            setTeamSheetData(t);
          } else {
            setTeamSheetData(null);
          }
        }
      } catch {
        if (!cancelled) {
          setPersonalSheetData(null);
          setTeamSheetData(null);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [resolvedEmployeeId]);

  const handleBack = () => {
    if (user?.role === 'SUPER_ADMIN') {
      navigate('/team')
    } else if (user?.role === 'TEAM_LEAD') {
      navigate('/teamlead')
    } else {
      navigate(-1)
    }
  }

  const handleInfoIconClick = (e, placementIdx, columnType) => {
    e.stopPropagation()
    const tooltipId = `${columnType}-${placementIdx}`
    setOpenTooltip(openTooltip === tooltipId ? null : tooltipId)
  }

  const handleSaveVbid = async () => {
    try {
      await updateVbidMutation.mutateAsync({ employeeId: employeeData.id, vbid: vbidValue })
      setIsEditingVbid(false);
    } catch (err) {
      alert(err.message);
    }
  }


  // Get current month's billing hours (or most recent if current month not found)
  const getCurrentMonthHours = (monthlyBilling) => {
    if (!monthlyBilling || monthlyBilling.length === 0) return null
    
    const now = new Date()
    const currentMonth = now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear()
    
    // Try to find current month first
    const currentMonthBilling = monthlyBilling.find(billing => billing.month === currentMonth)
    if (currentMonthBilling) {
      return currentMonthBilling.hours
    }
    
    // If current month not found, return the most recent month's hours
    // Assuming monthlyBilling is sorted chronologically, return the last entry
    if (monthlyBilling.length > 0) {
      return monthlyBilling[monthlyBilling.length - 1].hours
    }
    
    return null
  }

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on an info icon (will be handled by handleInfoIconClick)
      const isInfoIcon = event.target.closest('.info-icon-button')
      if (isInfoIcon) {
        return
      }

      // Check if click is inside the tooltip
      if (tooltipRef.current && tooltipRef.current.contains(event.target)) {
        return
      }

      // Close tooltip if clicking outside
      if (openTooltip) {
        setOpenTooltip(null)
      }
    }

    if (openTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openTooltip])

  // Get current month's billing status (or most recent if current month not found)
  const getCurrentMonthStatus = (monthlyBilling) => {
    if (!monthlyBilling || monthlyBilling.length === 0) return null
    
    const now = new Date()
    const currentMonth = now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear()
    
    // Try to find current month first
    const currentMonthBilling = monthlyBilling.find(billing => billing.month === currentMonth)
    if (currentMonthBilling) {
      return currentMonthBilling.status || 'Pending'
    }
    
    // If current month not found, return the most recent month's status
    if (monthlyBilling.length > 0) {
      return monthlyBilling[monthlyBilling.length - 1].status || 'Pending'
    }
    
    return null
  }

  // Info Icon Component
  const InfoIcon = ({ onClick, placementIdx, columnType, currentMonthHours, currentMonthStatus }) => {
    const tooltipId = `${columnType}-${placementIdx}`
    const isOpen = openTooltip === tooltipId
    const isBillingStatus = columnType === 'billingStatus'

    return (
      <div className="relative inline-flex items-center gap-2">
        {!isBillingStatus && currentMonthHours !== null && (
          <span className="text-sm text-slate-600 font-medium">{currentMonthHours}h</span>
        )}
        {isBillingStatus && currentMonthStatus !== null && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            currentMonthStatus === 'Billed' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {currentMonthStatus}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => onClick(e, placementIdx, columnType)}
          className="info-icon-button inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label={isBillingStatus ? "View monthly billing status" : "View monthly billing details"}
        >
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    )
  }

  // Tooltip Component
  const MonthlyBillingTooltip = ({ placement, placementIdx, columnType, onClose }) => {
    const tooltipId = `${columnType}-${placementIdx}`
    if (openTooltip !== tooltipId || !placement.monthlyBilling) return null

    const isBillingStatus = columnType === 'billingStatus'

    return (
      <div
        ref={tooltipRef}
        className="absolute z-50 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 p-4 animate-fadeIn"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          top: 'calc(100% + 8px)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            {isBillingStatus ? 'Monthly Billing Status' : 'Monthly Billing'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 font-semibold text-slate-700">Month</th>
                <th className={`${isBillingStatus ? 'text-left' : 'text-right'} py-2 px-2 font-semibold text-slate-700`}>
                  {isBillingStatus ? 'Status' : 'Hours'}
                </th>
              </tr>
            </thead>
            <tbody>
              {placement.monthlyBilling.map((billing, idx) => (
                <tr key={idx} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 px-2 text-slate-600">{billing.month}</td>
                  <td className={`py-2 px-2 ${isBillingStatus ? 'text-left' : 'text-right'} text-slate-600`}>
                    {isBillingStatus ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        billing.status === 'Billed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {billing.status || 'Pending'}
                      </span>
                    ) : (
                      <span className="font-medium">{billing.hours}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <Skeleton className="h-10 w-32 rounded-xl" />
               <Skeleton className="h-10 w-48 rounded-xl" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <Skeleton className="h-24 w-full rounded-2xl" />
               <Skeleton className="h-24 w-full rounded-2xl" />
               <Skeleton className="h-24 w-full rounded-2xl" />
               <Skeleton className="h-24 w-full rounded-2xl" />
             </div>
          </div>
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg px-8 py-6 max-w-md w-full text-center">
          <p className="text-red-600 font-medium mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const isL4ViewingSelf = user?.role === 'EMPLOYEE' && employeeData?.id === user?.id
  if (isL4ViewingSelf && employeeData) {
    return (
      <L4DashboardView
        employeeData={employeeData}
        currentPlacements={personalSheetData?.placements ?? []}
        formatPlacementDate={formatPlacementDate}
        personalSheetData={personalSheetData}
        teamSheetData={teamSheetData}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-4 md:p-8 relative overflow-hidden">
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
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Standard Header */}
        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-400/30 p-6 md:p-8 mb-8 border border-purple-300/50 relative overflow-hidden group">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-indigo-300/30 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl -ml-24 -mb-24 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 border border-white/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md"></div>
                  <div className="relative bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-white/30">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Employee Details
                  </h1>
                  <p className="text-white/90 mt-1.5 text-sm font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
                    {employeeData.recruiterName} · {employeeData.teamName}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-end gap-3">
                {/* Personal/Team Toggle - Show when user has personal and/or team data */}
                {canToggleView && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-1 py-1 flex items-center gap-1 border border-white/30">
                    <button
                      onClick={() => handleToggleView('personal')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        viewMode === 'personal'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-white hover:text-white/80'
                      }`}
                    >
                      Personal
                    </button>
                    <button
                      onClick={() => handleToggleView('team')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        viewMode === 'team'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-white hover:text-white/80'
                      }`}
                    >
                      Team
                    </button>
                  </div>
                )}

                {user?.id === employeeData?.id && user?.role !== 'EMPLOYEE' && (
                  <button
                    onClick={navigateToProfileEdit}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
              </div>
              
              <div className={`grid gap-4 ${
                isDualTarget 
                  ? 'grid-cols-1 sm:grid-cols-3' 
                  : 'grid-cols-1 sm:grid-cols-3'
              }`}>
              {isDualTarget ? (
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Yearly Revenue Target</div>
                    <div className="text-xl font-bold text-white leading-tight group-hover/item:text-yellow-200 transition-colors">{CalculationService.formatCurrency(dualRevenueTarget)}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Revenue Generated</div>
                    <div className="text-xl font-bold text-emerald-200 leading-tight group-hover/item:text-emerald-100 transition-colors">{employeeData.revenueGenerated}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Percentage</div>
                    <div className="text-xl font-bold text-blue-200 leading-tight group-hover/item:text-blue-100 transition-colors">{CalculationService.formatPercentage(dualRevenuePercent)}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Yearly Placement Target</div>
                    <div className="text-xl font-bold text-white leading-tight group-hover/item:text-yellow-200 transition-colors">{dualPlacementTarget}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Achieved</div>
                    <div className="text-xl font-bold text-emerald-200 leading-tight group-hover/item:text-emerald-100 transition-colors">{employeeData.placementsAchieved}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Percentage</div>
                    <div className="text-xl font-bold text-blue-200 leading-tight group-hover/item:text-blue-100 transition-colors">{CalculationService.formatPercentage(dualPlacementPercent)}</div>
                  </motion.div>
                </>
              ) : isVantagePersonalView ? (
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Placement Target</div>
                    <div className="text-xl font-bold text-white leading-tight group-hover/item:text-yellow-200 transition-colors">{employeeData.totalRevenue}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Placements Done</div>
                    <div className="text-xl font-bold text-emerald-200 leading-tight group-hover/item:text-emerald-100 transition-colors">{CalculationService.formatCurrency(Number(employeeData.placementsAchieved) || 0)}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Target Achieved</div>
                    <div className="text-xl font-bold text-blue-200 leading-tight group-hover/item:text-blue-100 transition-colors">{employeeData.targetAchieved}</div>
                  </motion.div>
                </>
              ) : isRevenueTarget ? (
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Target Revenue</div>
                    <div className="text-xl font-bold text-white leading-tight group-hover/item:text-yellow-200 transition-colors">{employeeData.totalRevenue}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Revenue Generated</div>
                    <div className="text-xl font-bold text-emerald-200 leading-tight group-hover/item:text-emerald-100 transition-colors">{employeeData.revenueGenerated}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Percentage</div>
                    <div className="text-xl font-bold text-blue-200 leading-tight group-hover/item:text-blue-100 transition-colors">{employeeData.revenueGeneratedPercentage}</div>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Target no of placements</div>
                    <div className="text-xl font-bold text-white leading-tight group-hover/item:text-yellow-200 transition-colors">{employeeData.targetPlacements}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Placements achieved</div>
                    <div className="text-xl font-bold text-emerald-200 leading-tight group-hover/item:text-emerald-100 transition-colors">{employeeData.placementsAchieved}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl border border-white/30 shadow-md hover:shadow-xl transition-all duration-300 group/item hover:bg-white/30"
                  >
                    <div className="text-[10px] text-white/80 mb-1.5 leading-tight font-medium uppercase tracking-wide">Percentage</div>
                    <div className="text-xl font-bold text-blue-200 leading-tight group-hover/item:text-blue-100 transition-colors">
                      {employeeData.targetAchieved}
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 p-6 md:p-8 border border-white/60">
          {/* Information Section - Grid Layout */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              {viewMode === 'team' ? 'Team Performance & Details' : 'Employee Information'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Basic Information</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <table className="w-full">
                    <tbody className="bg-white divide-y divide-slate-200">
                      <tr className="group hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50 w-1/3">
                          Login - VB Code
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {isEditingVbid ? (
                            <div className="flex items-center gap-2">
                               <input 
                                 type="text" 
                                 value={vbidValue} 
                                 onChange={(e) => setVbidValue(e.target.value)}
                                 className="border rounded px-2 py-1 text-sm w-32 focus:ring-2 focus:ring-blue-500 outline-none"
                               />
                               <button onClick={handleSaveVbid} className="text-green-600 hover:text-green-800 font-medium text-xs">Save</button>
                               <button onClick={() => setIsEditingVbid(false)} className="text-red-600 hover:text-red-800 font-medium text-xs">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{employeeData.loginVBCode}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                          Name
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{employeeData.recruiterName}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                          Team Lead
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{employeeData.teamLead}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                          Synopsis
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 italic">{employeeData.individualSynopsis}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Right Column: Performance Summary */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                  {viewMode === 'team' ? 'Team Performance Summary' : 'Individual Performance Summary'}
                </h3>
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <table className="w-full">
                    <tbody className="bg-white divide-y divide-slate-200">
                      {viewMode === 'team' && employeeData?.teamSummary ? (
                        <>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50 w-1/3">
                              Revenue Target
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {(employeeData.yearlyRevenueTargetFromProfile ?? employeeData.teamSummary.yearlyRevenueTarget)
                                ? CalculationService.formatCurrency(employeeData.yearlyRevenueTargetFromProfile ?? employeeData.teamSummary.yearlyRevenueTarget)
                                : '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Revenue Achieved
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-blue-600">
                              {employeeData.teamSummary.revenueAch 
                                ? CalculationService.formatCurrency(employeeData.teamSummary.revenueAch)
                                : (employeeData.teamSummary.totalRevenueGenerated 
                                    ? CalculationService.formatCurrency(employeeData.teamSummary.totalRevenueGenerated)
                                    : '-')}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Revenue Target Achieved %
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-green-600">
                                  {employeeData.teamSummary.revenueTargetAchievedPercent != null
                                    ? CalculationService.formatPercentage(employeeData.teamSummary.revenueTargetAchievedPercent)
                                    : '-'}
                                </span>
                                {employeeData.teamSummary.revenueTargetAchievedPercent != null && (
                                  <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px] overflow-hidden">
                                    <div 
                                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                      style={{width: `${Math.min(CalculationService.getDisplayPercentage(employeeData.teamSummary.revenueTargetAchievedPercent) || 0, 100)}%`}}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Placement Target
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {employeeData.teamSummary.yearlyPlacementTarget ?? '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Placements Done
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-blue-600">
                              {employeeData.teamSummary.placementDone != null
                                ? (CalculationService.formatPlacementCount(employeeData.teamSummary.placementDone) ?? employeeData.teamSummary.placementDone)
                                : '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Placement Target Achieved %
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-green-600">
                                  {employeeData.teamSummary.placementAchPercent != null
                                    ? CalculationService.formatPercentage(employeeData.teamSummary.placementAchPercent)
                                    : '-'}
                                </span>
                                {employeeData.teamSummary.placementAchPercent != null && (
                                  <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px] overflow-hidden">
                                    <div 
                                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.min(employeeData.teamSummary.placementAchPercent || 0, 100)}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Total Revenue Generated (USD)
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {employeeData.teamSummary.totalRevenueGenerated != null
                                ? CalculationService.formatCurrency(employeeData.teamSummary.totalRevenueGenerated)
                                : '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Slab Qualified
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {employeeData.teamSummary.slabQualified ? (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                  CalculationService.getSlabFromIncentivePercentage(employeeData.teamSummary.slabQualified, employeeData.teamName, employeeData.level).color
                                }`}>
                                  {CalculationService.formatSlabAsPercentage(employeeData.teamSummary.slabQualified)}
                                </span>
                              ) : '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Total Incentive
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600">
                              {employeeData.teamSummary.totalIncentiveInr 
                                ? CalculationService.formatCurrency(employeeData.teamSummary.totalIncentiveInr, 'INR')
                                : '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Incentive Paid
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                              {employeeData.teamSummary.totalIncentivePaidInr 
                                ? CalculationService.formatCurrency(employeeData.teamSummary.totalIncentivePaidInr, 'INR')
                                : '-'}
                            </td>
                          </tr>
                        </>
                      ) : viewMode === 'personal' && employeeData?.personalSummary ? (
                        <>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Total Revenue Generated (USD)
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-blue-600">
                              {employeeData.personalSummary.totalRevenueGenerated != null
                                ? CalculationService.formatCurrency(employeeData.personalSummary.totalRevenueGenerated)
                                : '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Placement Target
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {employeeData.personalSummary.yearlyPlacementTarget ?? '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Placements Done
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-blue-600">
                              {employeeData.personalSummary.placementDone != null
                                ? (CalculationService.formatPlacementCount(employeeData.personalSummary.placementDone) ?? employeeData.personalSummary.placementDone)
                                : '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Target Achieved
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-green-600">
                                  {employeeData.personalSummary.targetAchievedPercent != null
                                    ? CalculationService.formatPercentage(employeeData.personalSummary.targetAchievedPercent)
                                    : '-'}
                                </span>
                                {employeeData.personalSummary.targetAchievedPercent != null && (
                                  <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px] overflow-hidden">
                                    <div 
                                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.min(CalculationService.getDisplayPercentage(employeeData.personalSummary.targetAchievedPercent) || 0, 100)}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Slab Qualified
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {employeeData.personalSummary.slabQualified ? (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                  CalculationService.getSlabFromIncentivePercentage(employeeData.personalSummary.slabQualified, employeeData.teamName, employeeData.level).color
                                }`}>
                                  {CalculationService.formatSlabAsPercentage(employeeData.personalSummary.slabQualified)}
                                </span>
                              ) : '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Total Incentive
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600">
                              {employeeData.personalSummary.totalIncentiveInr 
                                ? CalculationService.formatCurrency(employeeData.personalSummary.totalIncentiveInr, 'INR')
                                : '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Incentive Paid
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                              {employeeData.personalSummary.totalIncentivePaidInr 
                                ? CalculationService.formatCurrency(employeeData.personalSummary.totalIncentivePaidInr, 'INR')
                                : '-'}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50 w-1/3">
                              {isRevenueTarget ? 'Yearly Target' : 'Target Placements'}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {isRevenueTarget ? employeeData.yearlyTarget : employeeData.targetPlacements}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Target Ach %
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-green-600">{employeeData.targetAchieved}</span>
                                <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px] overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                    style={{width: `${Math.min(employeeData.rawPercentage || 0, 100)}%`}}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Revenue Generated
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-blue-600">
                              {((viewMode === 'personal' && employeeData.personalSummary) || (viewMode === 'team' && employeeData.teamSummary)
                                ? employeeData.revenueGenerated
                                : (isRevenueTarget ? employeeData.revenueGenerated : employeeData.calculatedRevenueGenerated)) ?? '-'}
                            </td>
                          </tr>
                          {!isRevenueTarget && (
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                                Placements Done
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-blue-600">{employeeData.placementsAchieved}</td>
                            </tr>
                          )}
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Slab Qualified
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {(() => {
                                const dbSlab = employeeData.slabQualified;
                                const fromSnapshot = (viewMode === 'personal' && employeeData.personalSummary) || (viewMode === 'team' && employeeData.teamSummary);
                                if (dbSlab) {
                                  const slabInfo = CalculationService.getSlabFromIncentivePercentage(dbSlab, employeeData.teamName, employeeData.level);
                                  return (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${slabInfo.color}`}>
                                      {fromSnapshot ? CalculationService.formatSlabAsPercentage(dbSlab) : slabInfo.label}
                                    </span>
                                  );
                                }
                                if (fromSnapshot) return '-';
                                const slabInfo = CalculationService.calculateSlab(employeeData.targetAchieved, employeeData.teamName, employeeData.level);
                                return (
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${slabInfo.color}`}>
                                    {slabInfo.label}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Incentive Earned
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600">
                              {employeeData.incentiveINR ?? '-'}
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50/50">
                              Incentive (USD)
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 italic">
                              {employeeData.incentiveUSD ?? '-'}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Placements Section */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                Details of placements and billing status
              </h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                  <tr>
                    {viewMode === 'team' ? (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Candidate Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Recruiter Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Lead</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Split With</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Placement Year</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">DOJ</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">DOQ</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">PLC ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Placement Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Billing Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Collection Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Billed Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Revenue -Lead (USD)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Incentive amount (INR)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Incentive Paid (INR)</th>
                      </>
                    ) : viewMode === 'personal' ? (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Candidate Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Recruiter Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Placement Year</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">DOJ</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">DOQ</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">PLC ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Placement Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Billing Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Collection Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Billed Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Revenue (USD)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Incentive amount (INR)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Incentive Paid (INR)</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Candidate Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Placement Year</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">DOJ</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">DOQ</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">PLC ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Placement Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Billing Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Collection Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Billed Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Revenue (USD)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Incentive amount (INR)</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Incentive Paid (INR)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {currentPlacements.map((placement, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      {viewMode === 'team' ? (
                        <>
                          <td className="px-4 py-4 text-sm text-slate-700 font-medium">{placement.candidateName}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.recruiterName ?? '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.leadName ?? '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.splitWith ?? '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.placementYear ?? '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatPlacementDate(placement.doj)}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatPlacementDate(placement.doq)}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.client}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.plcId}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.placementType}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.billingStatus}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.collectionStatus ?? '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.totalBilledHours ?? '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                            {placement.revenueLeadUsd 
                              ? (typeof placement.revenueLeadUsd === 'number' 
                                  ? CalculationService.formatCurrency(placement.revenueLeadUsd)
                                  : placement.revenueLeadUsd)
                              : '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-semibold text-green-600">
                            {placement.incentiveInr 
                              ? (typeof placement.incentiveInr === 'number'
                                  ? CalculationService.formatCurrency(placement.incentiveInr, 'INR')
                                  : placement.incentiveInr)
                              : '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {placement.incentivePaidInr 
                              ? (typeof placement.incentivePaidInr === 'number'
                                  ? CalculationService.formatCurrency(placement.incentivePaidInr, 'INR')
                                  : placement.incentivePaidInr)
                              : '-'}
                          </td>
                        </>
                      ) : viewMode === 'personal' ? (
                        <>
                          <td className="px-4 py-4 text-sm text-slate-700 font-medium">{placement.candidateName}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.recruiter ?? '-'}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.placementYear}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{formatPlacementDate(placement.doj)}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{formatPlacementDate(placement.doq)}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.client}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.plcId}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                             <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                               (placement.placementType && placement.placementType.toUpperCase().includes('PERMANENT')) || 
                               (placement.placementType && placement.placementType.toUpperCase().includes('FTE'))
                                 ? 'bg-blue-100 text-blue-700' 
                                 : 'bg-purple-100 text-purple-700'
                             }`}>
                               {placement.placementType}
                             </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                             <div className="relative inline-flex items-center gap-2">
                               <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                 (placement.billingStatus === 'Done' || placement.billingStatus === 'BILLED') ? 'bg-green-100 text-green-700' :
                                 (placement.billingStatus === 'Pending' || placement.billingStatus === 'PENDING') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {placement.billingStatus === 'BILLED' ? 'Done' : placement.billingStatus === 'PENDING' ? 'Pending' : (placement.billingStatus || '-')}
                               </span>
                               {placement.monthlyBilling && placement.monthlyBilling.length > 0 && (
                                 <>
                                   <InfoIcon
                                     onClick={handleInfoIconClick}
                                     placementIdx={idx}
                                     columnType="billingStatus"
                                     currentMonthHours={getCurrentMonthHours(placement.monthlyBilling)}
                                     currentMonthStatus={getCurrentMonthStatus(placement.monthlyBilling)}
                                   />
                                   <MonthlyBillingTooltip
                                     placement={placement}
                                     placementIdx={idx}
                                     columnType="billingStatus"
                                     onClose={() => setOpenTooltip(null)}
                                   />
                                 </>
                               )}
                             </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.collectionStatus}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div className="relative inline-block">
                              {placement.placementType === 'FTE' ? (
                                <span className="text-slate-600 font-medium">-</span>
                              ) : (
                                placement.monthlyBilling && placement.monthlyBilling.length > 0 ? (
                                <>
                                  <InfoIcon
                                    onClick={handleInfoIconClick}
                                    placementIdx={idx}
                                    columnType="billedHours"
                                    currentMonthHours={getCurrentMonthHours(placement.monthlyBilling)}
                                  />
                                  <MonthlyBillingTooltip
                                    placement={placement}
                                    placementIdx={idx}
                                    columnType="billedHours"
                                    onClose={() => setOpenTooltip(null)}
                                  />
                                </>
                                ) : (
                                    <span className="text-slate-600 font-medium">{placement.billedHours || ''}</span>
                                )
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                            {placement.revenue 
                              ? (typeof placement.revenue === 'number' 
                                  ? CalculationService.formatCurrency(placement.revenue)
                                  : placement.revenue)
                              : '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-semibold text-green-600">
                            {placement.incentiveAmountINR 
                              ? (typeof placement.incentiveAmountINR === 'number'
                                  ? CalculationService.formatCurrency(placement.incentiveAmountINR, 'INR')
                                  : placement.incentiveAmountINR)
                              : '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {placement.incentivePaidInr 
                              ? (typeof placement.incentivePaidInr === 'number'
                                  ? CalculationService.formatCurrency(placement.incentivePaidInr, 'INR')
                                  : placement.incentivePaidInr)
                              : '-'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-4 text-sm text-slate-700 font-medium">
                            <div>{placement.candidateName}</div>
                            {placement.candidateId && placement.candidateId !== '-' && <div className="text-xs text-slate-500">{placement.candidateId}</div>}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.placementYear}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.doj}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.doq}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.client}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.plcId}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              placement.placementType === 'FTE' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {placement.placementType}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div className="relative inline-flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                (placement.billingStatus === 'Done' || placement.billingStatus === 'BILLED') ? 'bg-green-100 text-green-700' :
                                (placement.billingStatus === 'Pending' || placement.billingStatus === 'PENDING') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {placement.billingStatus === 'BILLED' ? 'Done' : placement.billingStatus === 'PENDING' ? 'Pending' : (placement.billingStatus || '-')}
                              </span>
                              {placement.monthlyBilling && placement.monthlyBilling.length > 0 && (
                                <>
                                  <InfoIcon
                                    onClick={handleInfoIconClick}
                                    placementIdx={idx}
                                    columnType="billingStatus"
                                    currentMonthHours={getCurrentMonthHours(placement.monthlyBilling)}
                                    currentMonthStatus={getCurrentMonthStatus(placement.monthlyBilling)}
                                  />
                                  <MonthlyBillingTooltip
                                    placement={placement}
                                    placementIdx={idx}
                                    columnType="billingStatus"
                                    onClose={() => setOpenTooltip(null)}
                                  />
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{placement.collectionStatus}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div className="relative inline-block">
                              {placement.placementType === 'FTE' ? (
                                <span className="text-slate-600 font-medium">-</span>
                              ) : (
                                placement.monthlyBilling && placement.monthlyBilling.length > 0 ? (
                                <>
                                  <InfoIcon
                                    onClick={handleInfoIconClick}
                                    placementIdx={idx}
                                    columnType="billedHours"
                                    currentMonthHours={getCurrentMonthHours(placement.monthlyBilling)}
                                  />
                                  <MonthlyBillingTooltip
                                    placement={placement}
                                    placementIdx={idx}
                                    columnType="billedHours"
                                    onClose={() => setOpenTooltip(null)}
                                  />
                                </>
                                ) : (
                                    <span className="text-slate-600 font-medium">{placement.billedHours || ''}</span>
                                )
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-medium">{placement.revenue}</td>
                          <td className="px-4 py-4 text-sm text-slate-600 font-semibold text-green-600">{placement.incentiveAmountINR}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <span className="text-slate-700 font-medium">
                              {placement.incentivePaidInr || '-'}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {currentPlacements.length === 0 && (
                    <tr>
                      <td colSpan="100%" className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="font-medium">No placements found</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetails

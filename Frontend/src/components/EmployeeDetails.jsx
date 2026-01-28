import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import CalculationService from '../utils/calculationService'

const EmployeeDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const { user } = useAuth()
  const { employeeId: stateEmployeeId } = location.state || {}

  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isEditingVbid, setIsEditingVbid] = useState(false)
  const [vbidValue, setVbidValue] = useState('')

  const [openTooltip, setOpenTooltip] = useState(null)
  const tooltipRef = useRef(null)

  const handleLogout = () => {
    // Assuming logout logic is available or can be passed
    navigate('/')
  }

  const navigateToProfileEdit = () => {
    // Navigate to a profile edit page or open a modal
    // For now, let's assume we navigate to a new route
    navigate(`/employee/${params.id}/edit`);
  };

  const isRevenueTarget = employeeData?.targetType === 'REVENUE'
  const showMargin = user?.role === 'S1_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEAM_LEAD';

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
      const response = await apiRequest(`/users/${employeeData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vbid: vbidValue })
      });
      if (!response.ok) throw new Error('Failed to update VBID');
      
      setEmployeeData(prev => ({ ...prev, loginVBCode: vbidValue }));
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

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const isSelf = user?.role === 'EMPLOYEE' && (!stateEmployeeId || stateEmployeeId === user.id)
        const endpoint = isSelf
          ? '/dashboard/employee'
          : `/dashboard/employee/${stateEmployeeId || params.id}`

        const response = await apiRequest(endpoint)
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Failed to load employee details')
        }

        const data = await response.json()

        const yearlyTarget = Number(data.yearlyTarget || 0)
        const revenueGenerated = Number(data.revenueGenerated || 0)
        const percentage = Number(data.percentage || 0)

        const placements = (data.placements || []).map((p) => ({
          candidateName: p.candidateName,
          candidateId: p.candidateId || '',
          clientId: p.clientId || '',
          jpcId: p.jpcId || '',
          doj: p.doj?.slice(0, 10),
          doq: p.doi?.slice(0, 10) || 'NA',
          daysCompleted: (p.daysCompleted !== undefined && p.daysCompleted !== null) ? String(p.daysCompleted) : '',
          client: p.clientName || p.client, // Fallback if clientName used
          placementType: p.placementType === 'PERMANENT' ? 'FTE' : 'Contract',
          billedHours: p.billedHours ? String(p.billedHours) : '',
          margin: CalculationService.formatPercentage(p.marginPercent),
          revenueGenerated: CalculationService.formatCurrency(p.revenue),
          billingStatus: p.billingStatus === 'BILLED' ? 'Done' : p.billingStatus === 'PENDING' ? 'Pending' : p.billingStatus,
          incentivePayoutETA: p.incentivePayoutEta ? p.incentivePayoutEta.slice(0, 10) : '',
          placementQualifier: p.qualifier ? 'Yes' : 'No',
          incentiveAmountINR: CalculationService.formatCurrency(p.incentiveAmountInr, 'INR'),
          incentivePaid: p.incentivePaid ? 'Yes' : 'No',
          monthlyBilling: (p.monthlyBilling || []).map((mb) => ({
            month: mb.month,
            hours: mb.hours || 0,
            status: mb.status === 'BILLED' ? 'Billed' : 'Pending',
          })),
        }))

        const incentiveUsd = data.incentive ? Number(data.incentive.amountUsd || 0) : 0
        const incentiveInr = data.incentive ? Number(data.incentive.amountInr || 0) : 0

        // Calculate total Incentive INR from placements (as user requested to sum from placements)
        const totalPlacementIncentiveInr = placements.reduce((sum, p) => {
           // Parse "₹1,234" or similar string back to number
           const valStr = p.incentiveAmountINR ? String(p.incentiveAmountINR).replace(/[^0-9.-]+/g,"") : "0";
           return sum + (Number(valStr) || 0);
        }, 0);

        // Calculate Incentive USD by dividing Total INR by 80
        const calculatedIncentiveUsd = totalPlacementIncentiveInr / 80;

        const mapped = {
          id: data.id,
          loginVBCode: data.vbid || 'VB' + String(data.id).slice(-3),
          recruiterName: data.name || 'Employee Name',
          teamLead: data.teamLead || 'Team Lead Name',
          teamName: data.team || 'Team Name',
          level: data.level,
          targetType: data.targetType || 'REVENUE',
          individualSynopsis: 'Active Recruiter',
          yearlyTarget: data.targetType === 'PLACEMENTS' ? String(yearlyTarget) : CalculationService.formatCurrency(yearlyTarget),
          targetAchieved: CalculationService.formatPercentage(percentage),
          targetPlacements: String(yearlyTarget),
          placementsAchieved: String(data.placementsCount || placements.length),
          revenueGenerated: CalculationService.formatCurrency(revenueGenerated),
          revenueGeneratedPercentage: CalculationService.formatPercentage(percentage),
          totalRevenue: data.targetType === 'PLACEMENTS' ? String(yearlyTarget) : CalculationService.formatCurrency(yearlyTarget),
          slabQualified: data.slabQualified || (data.incentive?.slabName || null),
          // Use calculated values for display
          incentiveUSD: CalculationService.formatCurrency(calculatedIncentiveUsd),
          incentiveINR: CalculationService.formatCurrency(totalPlacementIncentiveInr, 'INR'),
          placements,
        }

        if (isMounted) {
          setEmployeeData(mapped)
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
  }, [user, stateEmployeeId, params.id])

  if (loading || !employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employee details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg px-8 py-6 max-w-md w-full text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
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
              
              <div className="flex flex-col sm:flex-row gap-3">
              {isRevenueTarget ? (
                <>
                  <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group/item hover:bg-white/30">
                    <div className="text-[10px] text-white/80 mb-1 leading-tight font-medium uppercase tracking-wide">Target Revenue</div>
                    <div className="text-xl font-bold text-white leading-tight group-hover/item:text-yellow-200 transition-colors">{employeeData.totalRevenue}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group/item hover:bg-white/30">
                    <div className="text-[10px] text-white/80 mb-1 leading-tight font-medium uppercase tracking-wide">Revenue Generated</div>
                    <div className="text-xl font-bold text-emerald-200 leading-tight group-hover/item:text-emerald-100 transition-colors">{employeeData.revenueGenerated}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group/item hover:bg-white/30">
                    <div className="text-[10px] text-white/80 mb-1 leading-tight font-medium uppercase tracking-wide">Percentage</div>
                    <div className="text-xl font-bold text-blue-200 leading-tight group-hover/item:text-blue-100 transition-colors">{employeeData.revenueGeneratedPercentage}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group/item hover:bg-white/30">
                    <div className="text-[10px] text-white/80 mb-1 leading-tight font-medium uppercase tracking-wide">Target no of placements</div>
                    <div className="text-xl font-bold text-white leading-tight group-hover/item:text-yellow-200 transition-colors">{employeeData.targetPlacements}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group/item hover:bg-white/30">
                    <div className="text-[10px] text-white/80 mb-1 leading-tight font-medium uppercase tracking-wide">Placements achieved</div>
                    <div className="text-xl font-bold text-emerald-200 leading-tight group-hover/item:text-emerald-100 transition-colors">{employeeData.placementsAchieved}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 group/item hover:bg-white/30">
                    <div className="text-[10px] text-white/80 mb-1 leading-tight font-medium uppercase tracking-wide">Percentage</div>
                    <div className="text-xl font-bold text-blue-200 leading-tight group-hover/item:text-blue-100 transition-colors">
                      {employeeData.targetAchieved}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 p-6 md:p-8 border border-white/60">
          {/* Employee Info Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Basic Information
            </h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full">
                <tbody className="bg-white divide-y divide-slate-200">
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
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
                          {(user?.id === employeeData.id || user?.role === 'SUPER_ADMIN' || user?.role === 'TEAM_LEAD') && (
                             <button onClick={() => {
                               setVbidValue(employeeData.loginVBCode);
                               setIsEditingVbid(true);
                             }} className="text-blue-600 hover:text-blue-800 text-xs font-medium ml-2 opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                      Recruiter Name - Only Individual
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{employeeData.recruiterName}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                      Team Lead
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{employeeData.teamLead}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                      Individual Synopsis
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{employeeData.individualSynopsis}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                      {isRevenueTarget ? 'Yearly Target' : 'Target no of placements'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {isRevenueTarget ? employeeData.yearlyTarget : employeeData.targetPlacements}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                      Target Achieved %
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-green-600">{employeeData.targetAchieved}</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-xs">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                            style={{width: employeeData.targetAchieved}}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  {isRevenueTarget ? (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                        Revenue Generated
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-blue-600">{employeeData.revenueGenerated}</td>
                    </tr>
                  ) : (
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                        Placements Achieved
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-blue-600">{employeeData.placementsAchieved}</td>
                    </tr>
                  )}
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                      Slab qualified
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {(() => {
                        const dbSlab = employeeData.slabQualified;
                        let slabInfo;

                        if (dbSlab) {
                             // Use the helper to determine slab from the stored percentage
                             slabInfo = CalculationService.getSlabFromIncentivePercentage(dbSlab, employeeData.teamName, employeeData.level);
                        } else {
                             // Fallback to calculation based on Target Achieved %
                             slabInfo = CalculationService.calculateSlab(employeeData.targetAchieved, employeeData.teamName, employeeData.level);
                        }

                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${slabInfo.color}`}>
                            {slabInfo.label}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                      Incentive in USD
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-green-600">{employeeData.incentiveUSD}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 bg-blue-50">
                      Incentive in INR
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-green-600">{employeeData.incentiveINR}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Placements Section */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Details of placements and billing status
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Candidate Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">DOJ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">DOQ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Client ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">JPC ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Placement Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Revenue Generated</th>
                    {showMargin && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Margin</th>}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Billed Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Billing Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Days Completed</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">qualifier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Incentive amount (INR)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Incentive Paid (INR)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {employeeData.placements.map((placement, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-slate-700 font-medium">{placement.candidateName}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{placement.doj}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{placement.doq}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{placement.client}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{placement.clientId}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{placement.jpcId}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          placement.placementType === 'FTE' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {placement.placementType}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 font-semibold text-green-600">{placement.revenueGenerated}</td>
                      {showMargin && (
                        <td className="px-4 py-4 text-sm text-slate-600 font-semibold">
                          {placement.placementType === 'Contract' ? placement.margin : '-'}
                        </td>
                      )}
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <div className="relative inline-block">
                          {placement.placementType === 'FTE' ? (
                            <span className="text-slate-600 font-medium">
                              -
                            </span>
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
                                <span className="text-slate-600 font-medium">
                                  {placement.billedHours || ''}
                                </span>
                            )
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <div className="relative inline-block">
                          {placement.placementType === 'FTE' ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              placement.billingStatus === 'Done' ? 'bg-green-100 text-green-700' : 
                              placement.billingStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {placement.billingStatus}
                            </span>
                          ) : (
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
                      <td className="px-4 py-4 text-sm text-slate-600 font-medium">{placement.daysCompleted}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          placement.placementQualifier === 'Yes' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {placement.placementQualifier}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 font-semibold text-green-600">{placement.incentiveAmountINR}</td>
                      <td className="px-4 py-4 text-sm text-slate-600 font-semibold text-green-600">
                        {(() => {
                          const incentiveAmountStr = placement.incentiveAmountINR.replace(/[₹,]/g, '')
                          const incentiveAmount = parseFloat(incentiveAmountStr)
                          const incentivePaid = incentiveAmount * 0.5
                          return `₹${incentivePaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                        })()}
                      </td>
                    </tr>
                  ))}
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

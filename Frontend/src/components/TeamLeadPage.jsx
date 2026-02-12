import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import CalculationService from '../utils/calculationService'
import PieChart from './PieChart'

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
  }, [])

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

  const handleMemberClick = (member, lead, team) => {
    navigate(`/employee/${member.name.replace(/\s+/g, '-').toLowerCase()}`, {
      state: {
        employeeId: member.id,
        employeeName: member.name,
        teamLead: lead.name,
        teamName: team.name,
        level: member.level,
      },
    })
  }

  if (isLoading) {
    return <TeamLeadSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg px-8 py-6 max-w-md w-full text-center">
          <p className="text-red-600 font-medium mb-4">{error.message || 'Something went wrong'}</p>
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

  // Ensure data exists before rendering
  if (!teamData || !teamLeadData) return null

  const colorClasses = getTeamColorClasses(teamData.color)
  const members = teamLeadData.members || []
  const isPlacementTeam = teamLeadData.targetType === 'PLACEMENTS'
  
  // Use target from backend if available, otherwise calculate from members
  const leadTarget = teamLeadData.target || members.reduce((sum, member) => sum + (Number(member.target) || 0), 0)
  
  // Update teamLeadData target for consistency in this render cycle
  const currentLeadData = {
    ...teamLeadData,
    target: leadTarget
  }

  const formattedTeamTarget = isPlacementTeam 
    ? leadTarget 
    : CalculationService.formatCurrency(leadTarget)
  
  // Calculate total achievement percentage
   const achievedValue = isPlacementTeam 
     ? (currentLeadData.totalPlacements || 0)
     : (currentLeadData.totalRevenue || currentLeadData.targetAchieved || 0)
   
   const totalTarget = leadTarget || 1
   const achievementPercentage = Math.min(Math.round((achievedValue / totalTarget) * 100), 100)
 
   // Helper for Circular Progress
  const CircularProgress = ({ percentage, color = "text-green-500" }) => {
    const radius = 16
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

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
            className="text-slate-100"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-[#1e293b] text-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
           {/* Decorative Background Elements */}
           <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

          {/* Left: Profile Info */}
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto mb-6 md:mb-0">
            <div className="w-20 h-20 bg-slate-600/50 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
               <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
               </svg>
            </div>
            <div>
               <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 {teamLeadData.level || 'L2'} • Team Lead
               </div>
               <h1 className="text-3xl font-bold tracking-tight mb-1">{teamLeadData.name}</h1>
               <div className="text-slate-400 font-medium">{teamData.name}</div>
            </div>
          </div>

          {/* Right: Stats & Actions */}
          <div className="flex flex-wrap items-center gap-3 relative z-10">
             <div className="bg-slate-700/50 border border-slate-600/50 rounded-full px-5 py-2.5 flex items-center gap-2 backdrop-blur-md">
                <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-sm font-medium text-slate-200">{members.filter(m => m.name !== 'pass through').length} Members</span>
             </div>

             {/* View toggle for L2/L3 (TEAM_LEAD levels) */}
             {(teamLeadData.level === 'L2' || teamLeadData.level === 'L3') && (
               <div className="bg-slate-700/50 border border-slate-600/50 rounded-full px-1 py-1 flex items-center gap-1 backdrop-blur-md">
                 <button
                   onClick={() => setViewMode('personal')}
                   className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                     viewMode === 'personal'
                       ? 'bg-white text-slate-900'
                       : 'text-slate-300 hover:text-white'
                   }`}
                 >
                   Personal
                 </button>
                 <button
                   onClick={() => setViewMode('team')}
                   className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                     viewMode === 'team'
                       ? 'bg-white text-slate-900'
                       : 'text-slate-300 hover:text-white'
                   }`}
                 >
                   Team
                 </button>
               </div>
             )}

             <div className="bg-slate-700/50 border border-slate-600/50 rounded-full px-5 py-2.5 backdrop-blur-md">
                <span className="text-xs text-slate-400 mr-2">Total Target:</span>
                <span className="text-sm font-bold text-white">{formattedTeamTarget}</span>
             </div>

             <div className="bg-slate-700/50 border border-slate-600/50 rounded-full px-5 py-2.5 backdrop-blur-md">
                 <span className="text-xs text-slate-400 mr-2">Target Achieved:</span>
                 <span className="text-sm font-bold text-green-400">
                     {isPlacementTeam ? achievedValue : CalculationService.formatCurrency(achievedValue)}
                 </span>
                 <span className="text-xs text-slate-400 ml-1">({achievementPercentage}%)</span>
              </div>

             <button 
                onClick={handleLogout}
                className="bg-transparent border border-slate-600 hover:bg-slate-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ml-2"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
             </button>
          </div>
        </div>

        {/* My Personal Performance Section (sheet-backed, no new calculations) */}
        <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-bold text-slate-800">
              {viewMode === 'personal' ? 'My Personal Placements (Sheet)' : 'My Team Placements (Sheet)'}
            </h2>
          </div>
          <div className="text-sm text-slate-600 mb-2">
            Data below is read directly from the uploaded Excel sheet. No additional calculations are done in the app.
          </div>
          <div className="mt-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                  {viewMode === 'personal' ? (
                    <tr>
                      <th className="px-4 py-2 text-left">Candidate Name</th>
                      <th className="px-4 py-2 text-left">Placement Year</th>
                      <th className="px-4 py-2 text-left">DOJ</th>
                      <th className="px-4 py-2 text-left">DOQ</th>
                      <th className="px-4 py-2 text-left">Client</th>
                      <th className="px-4 py-2 text-left">PLC ID</th>
                      <th className="px-4 py-2 text-left">Placement Type</th>
                      <th className="px-4 py-2 text-left">Billing Status</th>
                      <th className="px-4 py-2 text-left">Collection Status</th>
                      <th className="px-4 py-2 text-left">Total Billed Hours</th>
                      <th className="px-4 py-2 text-left">Revenue (USD)</th>
                      <th className="px-4 py-2 text-left">Incentive amount (INR)</th>
                      <th className="px-4 py-2 text-left">Incentive Paid (INR)</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-2 text-left">Candidate Name</th>
                      <th className="px-4 py-2 text-left">Recruiter Name</th>
                      <th className="px-4 py-2 text-left">Split With</th>
                      <th className="px-4 py-2 text-left">Placement Year</th>
                      <th className="px-4 py-2 text-left">DOJ</th>
                      <th className="px-4 py-2 text-left">DOQ</th>
                      <th className="px-4 py-2 text-left">Client</th>
                      <th className="px-4 py-2 text-left">PLC ID</th>
                      <th className="px-4 py-2 text-left">Placement Type</th>
                      <th className="px-4 py-2 text-left">Billing Status</th>
                      <th className="px-4 py-2 text-left">Collection Status</th>
                      <th className="px-4 py-2 text-left">Total Billed Hours</th>
                      <th className="px-4 py-2 text-left">Revenue -Lead (USD)</th>
                      <th className="px-4 py-2 text-left">Incentive amount (INR)</th>
                      <th className="px-4 py-2 text-left">Incentive Paid (INR)</th>
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
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
               <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <h2 className="text-xl font-bold text-slate-800">Team Members</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.filter(m => m.name !== 'pass through').map((member) => {
                const memberIsPlacement = member.targetType === 'PLACEMENTS' || isPlacementTeam;
                const memberTarget = member.target || 0;
                const memberAchieved = memberIsPlacement 
                  ? (member.totalPlacements || member.placements || 0) 
                  : (member.totalRevenue || member.revenue || member.targetAchieved || 0);
                
                const memberPercentage = memberTarget > 0 ? Math.min(Math.round((memberAchieved / memberTarget) * 100), 100) : 0;
                
                // Dynamic color based on percentage
               let progressColor = "text-red-500";
               if (memberPercentage >= 75) progressColor = "text-green-500";
               else if (memberPercentage >= 50) progressColor = "text-yellow-500";

               return (
                <div 
                  key={member.id}
                  onClick={() => handleMemberClick(member, teamLeadData, teamData)}
                  className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-300">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{member.name}</h3>
                        <div className="text-slate-400 text-sm font-medium">{member.level || 'L4'}</div>
                      </div>
                    </div>
                    <CircularProgress percentage={memberPercentage} color={progressColor} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Total Target:</span>
                      <span className="text-slate-700 font-bold">
                        {memberIsPlacement ? memberTarget : CalculationService.formatCurrency(memberTarget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Achieved:</span>
                      <span className={`font-bold ${progressColor}`}>
                        {memberIsPlacement ? memberAchieved : CalculationService.formatCurrency(memberAchieved)}
                      </span>
                    </div>
                  </div>
                </div>
               )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamLeadPage

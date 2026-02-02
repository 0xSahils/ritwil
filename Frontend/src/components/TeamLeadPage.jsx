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

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        const response = await apiRequest('/dashboard/team-lead')
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

        {/* My Personal Performance Section */}
        <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <h2 className="text-xl font-bold text-slate-800">My Personal Performance</h2>
          </div>

          <div 
             onClick={() => handleMemberClick(currentLeadData, currentLeadData, teamData)}
             className="bg-white border border-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group max-w-sm border-l-4 border-l-blue-500"
          >
             <div className="flex items-start justify-between mb-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                   </svg>
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">My Stats</h3>
                   <div className="text-slate-400 text-sm font-medium">{currentLeadData.level || 'L2'}</div>
                 </div>
               </div>
               <CircularProgress 
                  percentage={achievementPercentage} 
                  color={
                    achievementPercentage >= 75 ? "text-green-500" :
                    achievementPercentage >= 50 ? "text-yellow-500" : "text-red-500"
                  } 
               />
             </div>

             <div className="space-y-3">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-slate-500 font-medium">My Target:</span>
                 <span className="text-slate-700 font-bold">
                    {isPlacementTeam ? currentLeadData.target : CalculationService.formatCurrency(currentLeadData.target)}
                 </span>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className="text-slate-500 font-medium">Achieved:</span>
                 <span className={`font-bold ${
                    achievementPercentage >= 75 ? "text-green-500" :
                    achievementPercentage >= 50 ? "text-yellow-500" : "text-red-500"
                 }`}>
                   {isPlacementTeam ? achievedValue : CalculationService.formatCurrency(achievedValue)}
                 </span>
               </div>
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

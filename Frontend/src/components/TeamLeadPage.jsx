import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import CalculationService from '../utils/calculationService'
import PieChart from './PieChart'
import RecursiveMemberNode from './RecursiveMemberNode'

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

  if (loading || !teamLeadData || !teamData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading team data...</p>
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

  const colorClasses = getTeamColorClasses(teamData.color)
  const members = teamLeadData.members || []
  // Calculate team target as sum of all team lead targets
  const calculatedTeamTarget = teamData.teamLeads.reduce((sum, lead) => {
    return sum + Number(lead.target || 0)
  }, 0)
  const formattedTeamTarget = CalculationService.formatCurrency(calculatedTeamTarget)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-4 md:p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/30"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full blur-3xl animate-float-gentle"></div>
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-gradient-to-br from-indigo-100/25 to-purple-100/20 rounded-full blur-3xl animate-float-gentle-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-100/20 to-blue-100/15 rounded-full blur-3xl animate-float-gentle-slow"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)', backgroundSize: '80px 80px'}}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - Similar to Alok Mishra */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-400/20 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-500/30 transition-all duration-300">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="white" opacity="0.3"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)"/>
            </svg>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-[0.03] rounded-full -ml-24 -mb-24 group-hover:scale-110 transition-transform duration-700"></div>

          <div className="relative z-10 flex items-center gap-4 mb-4 md:mb-0">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md"></div>
              <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{teamLeadData.name}</div>
              <div className="text-sm opacity-80 mt-1">{teamData.name}</div>
            </div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-3">
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {/* Count all descendants? For now just direct members count for display */}
                  {members.filter(m => m.name !== 'pass through').length} Direct Reports
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-80">Total Target:</span>
                  <span className="font-semibold">{formattedTeamTarget}</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-80">Target Achieved:</span>
                  <span className="font-semibold text-green-300">
                    {CalculationService.formatCurrency(teamLeadData.totalRevenue || 0)}
                  </span>
                  <span className="text-xs opacity-80">({teamData.targetAchieved || '0%'})</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/team-management')}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/20 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Manage Team
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-100 px-4 py-2 rounded-xl text-sm font-medium border border-red-500/30 transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 p-6 md:p-8 border border-white/60">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Team Members
          </h2>
          <div className="space-y-4">
            {members.filter(m => m.name !== 'pass through').map((member) => (
              <RecursiveMemberNode
                key={member.id}
                member={member}
                expandedMembers={expandedMembers}
                toggleMember={toggleMember}
                handleMemberClick={handleMemberClick}
                colorClasses={colorClasses}
                lead={teamLeadData}
                team={teamData}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamLeadPage

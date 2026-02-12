import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSuperAdminDashboard } from '../hooks/useDashboard'
import { Skeleton } from './common/Skeleton'
import AdminUserManagement from './AdminUserManagement'
import CalculationService from '../utils/calculationService'
import PieChart from './PieChart'
import RecursiveMemberNode from './RecursiveMemberNode'

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50 p-4 md:p-8">
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
  const { logout } = useAuth()
  const [expandedTeams, setExpandedTeams] = useState({})
  const [expandedMembers, setExpandedMembers] = useState({})
  
  const { data: teamData, isLoading, error, refetch } = useSuperAdminDashboard()

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

  const handleMemberClick = useCallback((member, lead, team) => {
    const slug = member.name.replace(/\s+/g, '-').toLowerCase()
    navigate(`/employee/${slug}`, {
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
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 p-6 md:p-8 mb-8 border border-white/60 animate-slideDown">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur opacity-30 animate-pulse-slow"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
                  VBeyond Corp
                </h1>
                <p className="text-slate-500 mt-1 text-sm flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Organization Structure & Team Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex bg-slate-100 rounded-full p-1 text-xs md:text-sm items-center gap-2">
                <button
                  onClick={() => setActiveSection('hierarchy')}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                    activeSection === 'hierarchy'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hierarchy
                </button>
                <button
                  onClick={() => setActiveSection('users')}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                    activeSection === 'users'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Manage Users
                </button>
                <button
                  onClick={() => navigate('/admin/teams')}
                  className="px-3 py-1.5 rounded-full font-medium transition-colors text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  Manage Teams
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="group bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-2xl transition-all duration-300 font-medium flex items-center gap-2 text-sm shadow-lg shadow-slate-300/50 hover:shadow-xl hover:shadow-slate-400/50 hover:scale-105"
              >
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {activeSection === 'hierarchy' && (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 p-6 md:p-8 border border-white/60 animate-fadeInUp">
          {/* Super User */}
          <div className="mb-10">
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-400/20 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden group hover:shadow-2xl hover:shadow-slate-500/30 transition-all duration-300">
              {/* Animated Background Pattern */}
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
                  <div className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
                    <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                    {teamData.superUser?.name || 'Super Admin'}
                  </div>
                  <div className="text-lg font-medium text-blue-100/80 tracking-wide">
                    Super User 2
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex gap-3">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    {teamData.teams.length} Teams
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    {teamData.teams.reduce((acc, team) => acc + team.teamLeads.length, 0)} Leads
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    {teamData.teams.reduce(
                      (acc, team) =>
                        acc +
                        team.teamLeads.reduce(
                          (sum, lead) => sum + lead.members.length,
                          0
                        ),
                      0
                    )}{' '}
                    team members
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats Section - REMOVED */}


          {/* Connector Line */}
          <div className="flex justify-center mb-10 relative">
            <div className="w-0.5 h-12 bg-gradient-to-b from-slate-300 via-blue-200 to-transparent rounded-full relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Teams */}
          <div className="space-y-5">
            {teamData.teams.map((team, teamIndex) => {
              const colorClasses = getTeamColorClasses(team.color)
              const isPlacementTeam = team.isPlacementTeam
              const calculatedTeamTarget = team.teamTarget || team.teamLeads.reduce((sum, lead) => {
                const leadTarget = Number(lead.target || 0)
                return sum + leadTarget
              }, 0)
              const formattedTeamTarget = isPlacementTeam 
                ? calculatedTeamTarget 
                : CalculationService.formatCurrency(calculatedTeamTarget)
              return (
                <div key={team.id} className={`border-l-2 ${colorClasses.border} pl-6 transition-all duration-200 animate-fadeInUp`} style={{animationDelay: `${teamIndex * 100}ms`}}>
                  {/* Team Header */}
                  <div
                    className={`bg-gradient-to-r ${colorClasses.light} backdrop-blur-md p-5 rounded-2xl cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-200 border border-gray-100/50 group relative overflow-hidden`}
                    onClick={() => toggleTeam(team.id)}
                  >
                    {/* Decorative SVG Corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="80" cy="20" r="30" fill="currentColor" className={colorClasses.text} opacity="0.1"/>
                        <circle cx="90" cy="10" r="20" fill="currentColor" className={colorClasses.text} opacity="0.15"/>
                      </svg>
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className={`relative ${colorClasses.icon} w-12 h-12 rounded-2xl flex items-center justify-center font-semibold text-base ${colorClasses.text} group-hover:scale-110 transition-transform duration-300`}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bg} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                          {teamIndex + 1}
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${colorClasses.text} flex items-center gap-2`}>
                            {team.name}
                            <div className={`w-1.5 h-1.5 ${colorClasses.badge} rounded-full animate-pulse`}></div>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            {team.teamLeads.length} Lead{team.teamLeads.length > 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2" title="Total Target">
                              <span className="text-xs font-semibold text-slate-700">{formattedTeamTarget}</span>
                            </div>
                            <div className="flex items-center gap-2" title="Achieved">
                              <span className="text-xs font-semibold text-green-600">
                                {isPlacementTeam 
                                  ? (team.totalRevenue || 0) 
                                  : CalculationService.formatCurrency(team.totalRevenue || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PieChart 
                          percentage={Number(team.targetAchieved || 0)} 
                          size={50}
                          colorClass={colorClasses.text}
                        />
                        <div className={`${colorClasses.badge} ${colorClasses.badgeText} px-3 py-1.5 rounded-xl text-xs font-medium shadow-sm`}>
                          {team.teamLeads.reduce((acc, lead) => acc + lead.members.length, 0)} Members
                        </div>
                        <svg
                          className={`w-5 h-5 text-slate-400 transition-all duration-300 group-hover:text-slate-600 ${
                            expandedTeams[team.id] ? 'transform rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Team Leads and Members */}
                  {expandedTeams[team.id] && (
                    <div className="mt-4 ml-4 space-y-3 animate-fadeIn">
                      {team.teamLeads.map((lead) => {
                        const levelBg = lead.level === 'L2' ? 'bg-amber-500/90' : lead.level === 'L3' ? 'bg-teal-500/90' : 'bg-slate-500/90'
                        const levelBgLight = lead.level === 'L2' ? 'bg-amber-50/50' : lead.level === 'L3' ? 'bg-teal-50/50' : 'bg-slate-50/50'
                        const levelBorder = lead.level === 'L2' ? 'border-amber-200/50' : lead.level === 'L3' ? 'border-teal-200/50' : 'border-slate-200/50'
                        const levelText = lead.level === 'L2' ? 'text-amber-700' : lead.level === 'L3' ? 'text-teal-700' : 'text-slate-700'
                        const levelBadge = lead.level === 'L2' ? 'bg-amber-100' : lead.level === 'L3' ? 'bg-teal-100' : 'bg-slate-100'
                        
                        return (
                          <div key={lead.id} className="border-l border-slate-200 pl-4 relative">
                            {/* Connector Dot */}
                            <div className="absolute left-0 top-6 w-2 h-2 bg-slate-300 rounded-full -translate-x-[5px]"></div>
                            
                            {/* Team Lead */}
                            <div
                              className={`${levelBgLight} backdrop-blur-md border ${levelBorder} p-4 rounded-2xl hover:shadow-md hover:scale-[1.02] transition-all duration-200 group`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleMemberClick(lead, lead, team)}>
                                  <div className={`relative ${levelBg} text-white w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className={`font-bold ${levelText} text-sm flex items-center gap-1.5 group-hover:text-blue-700 transition-colors`}>
                                      {lead.name}
                                      <svg className="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    {lead.target && (
                                      <div className="text-xs text-slate-500 mt-1 flex items-center">
                                        <span className="font-medium text-slate-600">
                                          Total Target: <span className="text-slate-900">
                                            {isPlacementTeam ? lead.target : CalculationService.formatCurrency(lead.target)}
                                          </span>
                                        </span>
                                        <span className="mx-2 text-slate-300">|</span>
                                        <span className="font-medium text-slate-600">
                                          Achieved: <span className="text-green-600">
                                            {isPlacementTeam 
                                              ? (lead.totalPlacements || lead.placements || 0) 
                                              : CalculationService.formatCurrency(lead.totalRevenue || 0)}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {lead.targetAchieved && (
                                    <PieChart 
                                      percentage={Number(lead.targetAchieved || 0)} 
                                      size={45}
                                      colorClass={levelText}
                                    />
                                  )}
                                  {lead.members.length > 0 && (
                                    <>
                                      <span className={`text-xs ${levelBadge} ${levelText} px-2.5 py-1 rounded-lg font-medium shadow-sm`}>
                                        {lead.members.length}
                                      </span>
                                      <div 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleMember(lead.id);
                                        }}
                                        className="p-1 cursor-pointer hover:bg-black/5 rounded-full transition-colors"
                                      >
                                        <svg
                                          className={`w-4 h-4 text-slate-400 transition-all duration-300 group-hover:text-slate-600 ${
                                            expandedMembers[lead.id] ? 'transform rotate-180' : ''
                                          }`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Nested Members Hierarchy */}
                            {expandedMembers[lead.id] && lead.members.length > 0 && (
                              <div className="mt-3 ml-4 space-y-3 animate-fadeIn">
                                {lead.members.map((member) => (
                                  <RecursiveMemberNode 
                                    key={member.id} 
                                    member={member} 
                                    expandedMembers={expandedMembers}
                                    toggleMember={toggleMember}
                                    handleMemberClick={handleMemberClick}
                                    colorClasses={colorClasses}
                                    lead={lead}
                                    team={team}
                                    depth={0}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        )}
        {activeSection === 'users' && (
          <div className="mt-6">
            <AdminUserManagement 
              embedded 
              autoOpenCreate={autoOpenCreate} 
              onModalOpened={() => setAutoOpenCreate(false)} 
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamPage

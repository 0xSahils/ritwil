import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../api/users';
import { getAuditLogs } from '../api/auditLogs';
import CalculationService from '../utils/calculationService';
import RecursiveMemberNode from './RecursiveMemberNode';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Skeleton, CardSkeleton, TableRowSkeleton } from './common/Skeleton';
import UserCreationModal from './UserCreationModal';
// Pie Chart Component
const PieChart = ({ percentage, size = 50, colorClass }) => {
  const radius = size / 2 - 4
  const center = size / 2
  const innerRadius = radius * 0.65 // For donut effect
  const circumference = 2 * Math.PI * radius
  
  // Calculate the angle for the pie slice
  const angle = (percentage / 100) * 360
  const largeArcFlag = angle > 180 ? 1 : 0
  
  // Calculate end point of the arc
  const endAngle = (angle * Math.PI) / 180
  const endX = center + radius * Math.sin(endAngle)
  const endY = center - radius * Math.cos(endAngle)
  
  // Start from top (12 o'clock position)
  const startX = center
  const startY = center - radius
  
  // Inner circle points for donut effect
  const innerEndX = center + innerRadius * Math.sin(endAngle)
  const innerEndY = center - innerRadius * Math.cos(endAngle)
  const innerStartX = center
  const innerStartY = center - innerRadius
  
  // Get gradient colors based on percentage
  const getGradientColors = (percentage) => {
    if (percentage <= 30) {
      return { start: '#ef4444', end: '#dc2626', stop1: '#f87171' }
    } else if (percentage <= 80) {
      return { start: '#eab308', end: '#ca8a04', stop1: '#facc15' }
    } else {
      return { start: '#22c55e', end: '#16a34a', stop1: '#4ade80' }
    }
  }
  
  const gradientColors = getGradientColors(percentage)
  const gradientId = `pie-gradient-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className="relative flex-shrink-0 group" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-md"
           style={{
             background: `radial-gradient(circle, ${gradientColors.start} 0%, transparent 70%)`,
             transform: 'scale(1.2)'
           }}
      />
      
      <svg width={size} height={size} className="transform -rotate-90 relative z-10 drop-shadow-lg">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.start} stopOpacity="1" />
            <stop offset="50%" stopColor={gradientColors.stop1} stopOpacity="1" />
            <stop offset="100%" stopColor={gradientColors.end} stopOpacity="1" />
          </linearGradient>
          
          <filter id={`shadow-${gradientId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-200/60"
          opacity="0.8"
        />
        
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="white"
          className="drop-shadow-sm"
        />
        
        {percentage > 0 && (
          <path
            d={`M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L ${innerEndX} ${innerEndY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY} Z`}
            fill={`url(#${gradientId})`}
            filter={`url(#shadow-${gradientId})`}
            className="transition-all duration-500 ease-out animate-scaleIn"
            style={{
              transformOrigin: `${center}px ${center}px`
            }}
          />
        )}
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <span className="text-[11px] font-extrabold text-slate-800 leading-none drop-shadow-sm" style={{
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
        }}>
          {Math.round(percentage)}
        </span>
        <span className="text-[8px] font-semibold text-slate-500 leading-none mt-0.5">%</span>
      </div>
      
      {percentage > 80 && (
        <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping" style={{ animationDuration: '2s' }} />
      )}
    </div>
  )
}

const S1AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hierarchy');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'hierarchy': return <HierarchyTab user={user} />;
      case 'members': return <MembersTab />;
      case 'l1-admins': return <L1AdminsTab />;
      case 'audit-logs': return <AuditLogsTab />;
      case 'settings': return <SettingsTab />;
      default: return <HierarchyTab user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-4 md:p-8 relative overflow-hidden font-sans text-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/30"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full blur-3xl animate-float-gentle"></div>
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-gradient-to-br from-indigo-100/25 to-purple-100/20 rounded-full blur-3xl animate-float-gentle-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-100/20 to-blue-100/15 rounded-full blur-3xl animate-float-gentle-slow"></div>
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
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                   </div>
                </div>
                <div>
                   <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">VBeyond Corp</h1>
                   <p className="text-slate-500 mt-1 text-sm flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Supreme Admin Console
                   </p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className="inline-flex bg-slate-100 rounded-full p-1 text-xs md:text-sm">
                   <button onClick={() => setActiveTab('hierarchy')} className={`px-3 py-1.5 rounded-full font-medium transition-colors ${activeTab === 'hierarchy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Hierarchy</button>
                   <button onClick={() => setActiveTab('members')} className={`px-3 py-1.5 rounded-full font-medium transition-colors ${activeTab === 'members' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Manage Members</button>
                   <button onClick={() => setActiveTab('l1-admins')} className={`px-3 py-1.5 rounded-full font-medium transition-colors ${activeTab === 'l1-admins' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Manage L1 Admins</button>
                   <button onClick={() => setActiveTab('audit-logs')} className={`px-3 py-1.5 rounded-full font-medium transition-colors ${activeTab === 'audit-logs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Audit Logs</button>
                   <button onClick={() => setActiveTab('settings')} className={`px-3 py-1.5 rounded-full font-medium transition-colors ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Settings</button>
                </div>
                <button 
                   onClick={logout} 
                   className="group bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-2xl transition-all duration-300 font-medium flex items-center gap-2 text-sm shadow-lg shadow-slate-300/50 hover:shadow-xl hover:shadow-slate-400/50 hover:scale-105"
                >
                   <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                   Logout
                </button>
             </div>
          </div>
       </div>

       {/* Main Content */}
       <div className="animate-fadeInUp">
          {renderContent()}
       </div>
      </div>
    </div>
  );
};

const HierarchyTab = ({ user }) => {
    const navigate = useNavigate();
    const [expandedAdmins, setExpandedAdmins] = useState({});
    const [expandedTeams, setExpandedTeams] = useState({});
    const [expandedLeads, setExpandedLeads] = useState({});

    const { data: hierarchyData = { superAdmins: [], unassignedTeams: [] }, isLoading: loading } = useQuery({
        queryKey: ['hierarchyData'],
        queryFn: async () => {
            // 1. Fetch Super Admins (L1)
            const adminsRes = await getUsers({ role: 'SUPER_ADMIN', pageSize: 100 });
            const superAdmins = adminsRes.data || [];

            // 2. Fetch All Teams Data (Full Hierarchy)
            const teamsRes = await apiRequest('/dashboard/super-admin');
            if (!teamsRes.ok) throw new Error('Failed to fetch teams');
            const teamsData = await teamsRes.json();
            const allTeams = teamsData.teams || [];

            // 3. Fetch Team Leads to map to Super Admins
            const leadsRes = await getUsers({ role: 'TEAM_LEAD', pageSize: 1000 });
            const leads = leadsRes.data || [];
            
            // Map Lead ID -> Manager ID (Super Admin ID)
            const leadManagerMap = {};
            leads.forEach(lead => {
                if (lead.manager) {
                    leadManagerMap[lead.id] = lead.manager.id;
                }
            });

            // 4. Assign Teams to Super Admins
            const adminTeamsMap = {}; // AdminID -> [Teams]
            
            // Initialize map for all admins
            superAdmins.forEach(admin => {
                adminTeamsMap[admin.id] = [];
            });
            
            const unassignedTeams = [];

            allTeams.forEach(team => {
                let assignedAdminId = null;
                
                if (team.teamLeads && team.teamLeads.length > 0) {
                    for (const lead of team.teamLeads) {
                        const managerId = leadManagerMap[lead.id];
                        if (managerId && adminTeamsMap[managerId]) {
                            assignedAdminId = managerId;
                            break;
                        }
                    }
                }

                if (assignedAdminId) {
                    adminTeamsMap[assignedAdminId].push(team);
                } else {
                    unassignedTeams.push(team);
                }
            });

            const adminsWithTeams = superAdmins.map(admin => ({
                ...admin,
                teams: adminTeamsMap[admin.id] || []
            }));

            return {
                superAdmins: adminsWithTeams,
                unassignedTeams
            };
        },
        placeholderData: keepPreviousData
    });

    const toggleAdmin = (adminId) => {
        setExpandedAdmins(prev => ({ ...prev, [adminId]: !prev[adminId] }));
    };

    const toggleTeam = (teamId) => {
        setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
    };

    const toggleLead = (leadId) => {
        setExpandedLeads(prev => ({ ...prev, [leadId]: !prev[leadId] }));
    };

    const handleMemberClick = (member) => {
        navigate(`/employee/${member.id}`);
    };

    const getTeamColorClasses = (color) => {
        const colors = {
          blue: { bg: 'from-sky-400/90 to-blue-500/90', light: 'from-sky-50/50 to-blue-50/50', border: 'border-sky-200/60', text: 'text-sky-700', badge: 'bg-sky-100', badgeText: 'text-sky-700', icon: 'bg-sky-500/10' },
          orange: { bg: 'from-amber-400/90 to-orange-500/90', light: 'from-amber-50/50 to-orange-50/50', border: 'border-amber-200/60', text: 'text-amber-700', badge: 'bg-amber-100', badgeText: 'text-amber-700', icon: 'bg-amber-500/10' },
          purple: { bg: 'from-violet-400/90 to-purple-500/90', light: 'from-violet-50/50 to-purple-50/50', border: 'border-violet-200/60', text: 'text-violet-700', badge: 'bg-violet-100', badgeText: 'text-violet-700', icon: 'bg-violet-500/10' },
          green: { bg: 'from-emerald-400/90 to-teal-500/90', light: 'from-emerald-50/50 to-teal-50/50', border: 'border-emerald-200/60', text: 'text-emerald-700', badge: 'bg-emerald-100', badgeText: 'text-emerald-700', icon: 'bg-emerald-500/10' }
        };
        return colors[color] || colors.blue;
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-fadeInUp">
                <CardSkeleton />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                  <Skeleton className="h-32 rounded-xl" />
                </div>
                <div className="space-y-4">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
            </div>
        );
    }

    const allTeams = [...hierarchyData.superAdmins.flatMap(a => a.teams), ...hierarchyData.unassignedTeams];
    const totalTarget = allTeams.reduce((sum, team) => sum + (Number(team.teamTarget) || 0), 0);
    const avgPerformance = allTeams.length > 0 
        ? allTeams.reduce((sum, team) => sum + (Number(team.targetAchieved) || 0), 0) / allTeams.length 
        : 0;

    return (
        <div className="space-y-8 animate-fadeInUp">
            {/* Supreme Admin Card */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-400/20 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1" fill="white" opacity="0.3"/>
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)"/>
                    </svg>
                </div>
                <div className="relative z-10 flex items-center gap-4 mb-4 md:mb-0">
                    <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <div className="text-xs font-medium opacity-70 tracking-wide mb-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            S1_ADMIN
                        </div>
                        <div className="text-2xl font-bold tracking-tight">{user?.name || 'Supreme Administrator'}</div>
                    </div>
                </div>
                
                <div className="flex gap-3 relative z-10 mt-4 md:mt-0">
                </div>
            </div>

            {/* Connection Line */}
            <div className="flex justify-center relative -my-4 z-0">
                <div className="h-12 w-0.5 bg-slate-300"></div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard 
                    title="Total Super Admins" 
                    value={hierarchyData.superAdmins.length} 
                    change="Active"
                    trend="neutral"
                    icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
                <StatCard 
                    title="Total Teams" 
                    value={allTeams.length} 
                    change="Deployed"
                    trend="neutral"
                    icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                />
                <StatCard 
                    title="Total Members" 
                    value={allTeams.reduce((acc, team) => acc + (team.teamLeads?.reduce((sum, lead) => sum + (lead.members?.length || 0) + (lead.subLeads?.reduce((s, sl) => s + (sl.members?.length || 0), 0) || 0), 0) || 0), 0)}
                    change="Active"
                    trend="neutral"
                    icon={<svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                />
            </div>

            {/* Team Management Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Team Management</h3>
                        <p className="text-sm text-slate-500">Manage all teams across the organization</p>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/teams')} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage Teams
                    </button>
                </div>
            </div>

            {/* Super Admins List (Accordion) */}
            <div className="space-y-4">
                <h3 className="text-center text-slate-500 font-medium mb-6 uppercase tracking-wider text-xs">Direct Reports (L1 Admins)</h3>
                
                {hierarchyData.superAdmins.map(admin => (
                    <div key={admin.id} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden">
                        <div 
                            className="p-4 md:p-6 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-colors"
                            onClick={() => toggleAdmin(admin.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm">
                                    {admin.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">{admin.name}</h4>
                                    <p className="text-sm text-slate-500">{admin.email} • {admin.teams.length} Teams</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {admin.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expandedAdmins[admin.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>

                        {/* Admin's Teams */}
                        {expandedAdmins[admin.id] && (
                            <div className="bg-slate-50/50 border-t border-slate-100 p-4 md:p-6 space-y-4 animate-fadeIn">
                                {admin.teams.length === 0 ? (
                                    <div className="text-center py-4 text-slate-500 text-sm">No teams assigned</div>
                                ) : (
                                    admin.teams.map((team, index) => {
                                        const colors = getTeamColorClasses(team.color || 'blue');
                                        const calculatedTeamTarget = team.teamLeads?.reduce((sum, lead) => sum + Number(lead.target || 0), 0) || 0;
                                        const isPlacementTeam = team.isPlacementTeam || (team.teamLeads?.length > 0 && team.teamLeads[0].targetType === 'PLACEMENTS');
                                        const formattedTeamTarget = isPlacementTeam 
                                            ? calculatedTeamTarget 
                                            : CalculationService.formatCurrency(calculatedTeamTarget);
                                        
                                        return (
                                            <div key={team.id} className={`border-l-2 ${colors.border} pl-4 md:pl-6 transition-all duration-200`}>
                                                <div 
                                                    className={`bg-gradient-to-r ${colors.light} backdrop-blur-md p-5 rounded-2xl cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-200 border border-gray-100/50 group relative overflow-hidden`}
                                                    onClick={() => toggleTeam(team.id)}
                                                >
                                                    {/* Decorative SVG Corner */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                                                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="80" cy="20" r="30" fill="currentColor" className={colors.text} opacity="0.1"/>
                                                            <circle cx="90" cy="10" r="20" fill="currentColor" className={colors.text} opacity="0.15"/>
                                                        </svg>
                                                    </div>

                                                    <div className="flex items-center justify-between relative z-10">
                                                        <div className="flex items-center space-x-4">
                                                            <div className={`relative ${colors.icon} w-12 h-12 rounded-2xl flex items-center justify-center font-semibold text-base ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                                                                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <div className={`text-lg font-bold ${colors.text} flex items-center gap-2`}>
                                                                    {team.name}
                                                                    <div className={`w-1.5 h-1.5 ${colors.badge} rounded-full animate-pulse`}></div>
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                                    </svg>
                                                                    {team.teamLeads?.length || 0} Lead{team.teamLeads?.length !== 1 ? 's' : ''}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-slate-600 font-medium">Target:</span>
                                                                        <span className="text-xs font-semibold text-slate-700">{formattedTeamTarget}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-slate-600 font-medium">Achieved:</span>
                                                                        <span className="text-xs font-semibold text-green-600">
                                                                            {isPlacementTeam 
                                                                                ? CalculationService.calculateAchievedValue(calculatedTeamTarget, team.targetAchieved)
                                                                                : CalculationService.formatCurrency(
                                                                                    CalculationService.calculateAchievedValue(calculatedTeamTarget, team.targetAchieved)
                                                                                )
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="hidden md:block">
                                                                <PieChart 
                                                                    percentage={Number(team.targetAchieved || 0)} 
                                                                    size={50}
                                                                    colorClass={colors.text}
                                                                />
                                                            </div>
                                                            <svg className={`w-5 h-5 ${colors.text} transition-transform duration-300 ${expandedTeams[team.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>




                                                {/* Team Leads */}
                                                {expandedTeams[team.id] && (
                                                    <div className="mt-4 ml-4 space-y-3 animate-fadeIn">
                                                        {team.teamLeads?.map(lead => (
                                                            <div key={lead.id} className="border-l border-slate-200 pl-4 relative">
                                                                <div className="absolute left-0 top-6 w-2 h-2 bg-slate-300 rounded-full -translate-x-[5px]"></div>
                                                                
                                                                <RecursiveMemberNode
                                                                    member={lead}
                                                                    expandedMembers={expandedLeads}
                                                                    toggleMember={toggleLead}
                                                                    handleMemberClick={handleMemberClick}
                                                                    colorClasses={getTeamColorClasses(team.color || 'blue')}
                                                                    lead={lead}
                                                                    team={team}
                                                                />
                                                            </div>
                                                        ))}
                                                        {(!team.teamLeads || team.teamLeads.length === 0) && (
                                                            <div className="text-center text-sm text-slate-500 py-2">No leads assigned</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Unassigned Teams Section (if any) */}
                {hierarchyData.unassignedTeams.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-200/60">
                         <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-slate-400 font-medium uppercase tracking-wider text-xs">Unassigned / Other Teams</h3>
                            <div className="h-px flex-1 bg-slate-200/60"></div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hierarchyData.unassignedTeams.map(team => {
                                // Use neutral slate colors for unassigned teams
                                const colors = {
                                    bg: 'from-slate-100 to-slate-200',
                                    light: 'from-slate-50/50 to-gray-50/50',
                                    border: 'border-slate-200',
                                    text: 'text-slate-600',
                                    badge: 'bg-slate-200',
                                    icon: 'bg-slate-300/20'
                                };
                                
                                return (
                                    <div key={team.id} className={`group relative bg-gradient-to-br ${colors.light} backdrop-blur-md p-5 rounded-2xl border ${colors.border} hover:shadow-md transition-all duration-300`}>
                                        {/* Decorative SVG Corner - grayscale */}
                                        <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="80" cy="20" r="30" fill="currentColor" className="text-slate-400"/>
                                                <circle cx="90" cy="10" r="20" fill="currentColor" className="text-slate-400"/>
                                            </svg>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center text-slate-500`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-500 border border-slate-300/50">
                                                    Unassigned
                                                </span>
                                            </div>
                                            
                                            <h4 className={`text-lg font-bold ${colors.text} mb-1`}>{team.name}</h4>
                                            <p className="text-xs text-slate-500 mb-4">No Super Admin linked</p>
                                            
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Target</span>
                                                    <span className="text-sm font-semibold text-slate-600">
                                                        {CalculationService.formatCurrency(team.yearlyTarget || 0)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Leads</span>
                                                    <span className="text-sm font-semibold text-slate-600">{team.teamLeads?.length || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, change, icon, trend }) => (
  <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-white/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
       <div className="p-3 bg-white rounded-lg shadow-sm">{icon}</div>
       {trend === 'up' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">↑ Trending</span>}
    </div>
    <p className="text-slate-500 text-sm mb-1 font-medium">{title}</p>
    <div className="flex justify-between items-end">
       <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
       <span className="text-slate-500 text-xs font-medium bg-slate-100 px-2 py-1 rounded-full">{change}</span>
    </div>
  </div>
);

const L1AdminsTab = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "SUPER_ADMIN",
    level: "L1",
    yearlyTarget: ""
  });

  const { data: { data: admins = [], pagination } = {}, isLoading: loading } = useQuery({
    queryKey: ['l1Admins', { page, pageSize }],
    queryFn: () => getUsers({ role: 'SUPER_ADMIN', page, pageSize }),
    refetchInterval: 15000, // Poll every 15s
    placeholderData: keepPreviousData
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAdmin ? `/users/${editingAdmin.id}` : "/users";
      const method = editingAdmin ? "PUT" : "POST";
      
      const payload = { ...formData };
      if (editingAdmin && !payload.password) delete payload.password;

      const response = await apiRequest(url, {
        method: method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Operation failed");
      }

      setShowModal(false);
      setEditingAdmin(null);
      resetForm();
      queryClient.invalidateQueries(['l1Admins']);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this admin?")) return;
      try {
          const response = await apiRequest(`/users/${id}`, { method: 'DELETE' });
          if(!response.ok) throw new Error("Failed to delete");
          queryClient.invalidateQueries(['l1Admins']);
      } catch (err) {
          alert(err.message);
      }
  };

  const openEditModal = (admin) => {
      setEditingAdmin(admin);
      setFormData({
          name: admin.name,
          email: admin.email,
          password: "",
          role: "SUPER_ADMIN",
          level: admin.level || "L1",
          yearlyTarget: admin.yearlyTarget || ""
      });
      setShowModal(true);
  };

  const openCreateModal = () => {
      setEditingAdmin(null);
      resetForm();
      setShowModal(true);
  };

  const resetForm = () => {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "SUPER_ADMIN",
        level: "L1",
        yearlyTarget: ""
      });
  };

  if (loading && !admins.length) return (
      <div className="space-y-6 animate-fadeInUp">
          <div className="flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-slate-800">Super Admins (L1)</h2>
                <Skeleton className="h-4 w-64 mt-1" />
             </div>
             <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/60 overflow-hidden">
             <table className="w-full text-left">
                 <thead className="bg-white/50 border-b border-white/60">
                    <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                       <th className="py-4 pl-6">Admin Name</th>
                       <th className="py-4">Role</th>
                       <th className="py-4">Target</th>
                       <th className="py-4">Status</th>
                       <th className="py-4 text-right pr-6">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/60">
                    <TableRowSkeleton cols={5} />
                    <TableRowSkeleton cols={5} />
                    <TableRowSkeleton cols={5} />
                    <TableRowSkeleton cols={5} />
                    <TableRowSkeleton cols={5} />
                 </tbody>
             </table>
          </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-fadeInUp">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">Super Admins (L1)</h2>
             <p className="text-slate-500 mt-1">Manage campaign managers and their datasets.</p>
          </div>
          <button 
             onClick={openCreateModal}
             className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium flex items-center gap-2 shadow-blue-500/30"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             Create Super Admin
          </button>
       </div>
  
       <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/60 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-white/50 border-b border-white/60">
                <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                   <th className="py-4 pl-6">Admin Name</th>
                   <th className="py-4">Role</th>
                   <th className="py-4">Target</th>
                   <th className="py-4">Status</th>
                   <th className="py-4 text-right pr-6">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/60">
                {admins.map(admin => (
                   <tr key={admin.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-4 pl-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                              {admin.name.charAt(0)}
                            </div>
                            <div>
                               <span className="font-medium text-slate-800 block">{admin.name}</span>
                               <span className="text-xs text-slate-400">{admin.email}</span>
                            </div>
                         </div>
                      </td>
                      <td className="py-4 text-slate-600">
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium border border-purple-200">
                            {admin.role}
                          </span>
                      </td>
                      <td className="py-4 text-slate-600 font-mono text-sm">
                          {admin.yearlyTarget ? CalculationService.formatCurrency(admin.yearlyTarget) : '-'}
                      </td>
                      <td className="py-4">
                        {admin.isActive ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">Active</span>
                        ) : (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium border border-red-200">Inactive</span>
                        )}
                      </td>
                      <td className="py-4 text-right pr-6">
                         <button onClick={() => openEditModal(admin)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">Edit</button>
                         <button onClick={() => handleDelete(admin.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                      </td>
                   </tr>
                ))}
                {admins.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-8 text-slate-500">No Super Admins found</td></tr>
                )}
             </tbody>
          </table>
       </div>

       {/* Pagination Controls */}
       {pagination && (
          <div className="flex items-center justify-between text-sm text-slate-600 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/60">
            <div>
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
       )}

       {/* Create/Edit Modal */}
       {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{editingAdmin ? 'Edit Admin' : 'Create Super Admin'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="john@vbeyond.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password {editingAdmin && <span className="text-slate-400 font-normal">(Leave blank to keep)</span>}
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Yearly Target ($)</label>
                <input
                  type="number"
                  value={formData.yearlyTarget}
                  onChange={(e) => setFormData({ ...formData, yearlyTarget: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="1000000"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm"
                >
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MembersTab = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await apiRequest("/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries(['members']);
  };

  const { data: { data: members = [], pagination } = {}, isLoading: loading } = useQuery({
    queryKey: ['members', { page, roleFilter }],
    queryFn: async () => {
        const params = { page, pageSize: 20 };
        if (roleFilter) params.role = roleFilter;
        const res = await getUsers(params);
        // Filter out S1_ADMIN and SUPER_ADMIN if returned
        res.data = (res.data || []).filter(u => u.role !== 'S1_ADMIN' && u.role !== 'SUPER_ADMIN');
        return res;
    },
    placeholderData: keepPreviousData
  });

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this member?")) return;
      try {
          const response = await apiRequest(`/users/${id}`, { method: 'DELETE' });
          if(!response.ok) throw new Error("Failed to delete");
          queryClient.invalidateQueries(['members']);
      } catch (err) {
          alert(err.message);
      }
  };

  if (loading && !members.length) return (
      <div className="space-y-6 animate-fadeInUp">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Team Members</h2>
               <Skeleton className="h-4 w-64 mt-1" />
            </div>
            <Skeleton className="h-10 w-40 rounded-lg" />
         </div>
    
         <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/60 overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-white/50 border-b border-white/60">
                  <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                     <th className="py-4 pl-6">Member</th>
                     <th className="py-4">Role</th>
                     <th className="py-4">Team</th>
                     <th className="py-4">Manager</th>
                     <th className="py-4">Status</th>
                     <th className="py-4 text-right pr-6">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/60">
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
               </tbody>
            </table>
         </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-fadeInUp">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">Team Members</h2>
             <p className="text-slate-500 mt-1">Manage all employees and team leads.</p>
          </div>
          <select 
            value={roleFilter} 
            onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
            }}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="TEAM_LEAD">Team Leads</option>
            <option value="EMPLOYEE">Employees</option>
            <option value="LIMITED_ACCESS">Limited Access</option>
          </select>
       </div>
  
       <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/60 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-white/50 border-b border-white/60">
                <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                   <th className="py-4 pl-6">Member</th>
                   <th className="py-4">Role</th>
                   <th className="py-4">Team</th>
                   <th className="py-4">Manager</th>
                   <th className="py-4">Status</th>
                   <th className="py-4 text-right pr-6">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/60">
                {members.map(member => (
                   <tr key={member.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-4 pl-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                               <span className="font-medium text-slate-800 block">{member.name}</span>
                               <span className="text-xs text-slate-400">{member.email}</span>
                            </div>
                         </div>
                      </td>
                      <td className="py-4 text-slate-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            member.role === 'TEAM_LEAD' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {member.role}
                          </span>
                      </td>
                      <td className="py-4 text-slate-600 text-sm">
                          {member.team?.name || '-'}
                      </td>
                      <td className="py-4 text-slate-600 text-sm">
                          {member.manager?.name || '-'}
                      </td>
                      <td className="py-4">
                        {member.isActive ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">Active</span>
                        ) : (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium border border-red-200">Inactive</span>
                        )}
                      </td>
                      <td className="py-4 text-right pr-6">
                         <button onClick={() => navigate(`/employee/${member.id}`)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">View</button>
                         <button onClick={() => openEditModal(member)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">Edit</button>
                         <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                      </td>
                   </tr>
                ))}
                {members.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-8 text-slate-500">No members found</td></tr>
                )}
             </tbody>
          </table>
       </div>

       {/* Pagination Controls */}
       {pagination && (
          <div className="flex items-center justify-between text-sm text-slate-600 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/60">
            <div>
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
       )}
       
       <UserCreationModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editingUser={editingUser}
          onSuccess={handleSuccess}
          teams={teams}
       />
    </div>
  );
};

const AuditLogsTab = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  const { data: { data: logs = [], pagination } = {}, isLoading: loading } = useQuery({
    queryKey: ['auditLogs', { page, ...filters }],
    queryFn: async () => {
        const params = { page, pageSize: 50 };
        if (filters.module) params.module = filters.module;
        if (filters.action) params.action = filters.action;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        return getAuditLogs(params);
    },
    placeholderData: keepPreviousData
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    // useQuery will automatically refetch because filters state updated
  };

  const handleExport = async (formatType) => {
    try {
        const queryParams = new URLSearchParams({ ...filters, format: formatType });
        const response = await apiRequest(`/audit-logs/export?${queryParams.toString()}`);
        
        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs.${formatType === 'excel' ? 'xlsx' : formatType}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err) {
        console.error('Export error:', err);
        alert('Failed to export logs');
    }
  };

  return (
   <div className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Activity History / Audit Log</h2>
            <p className="text-slate-500 mt-1">Complete history of system actions and changes.</p>
         </div>
         <div className="flex gap-3">
            <button
              onClick={() => handleExport('csv')}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition shadow-sm shadow-blue-500/30"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export Excel
            </button>
         </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/60 p-6">
         {/* Filter controls */}
         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 items-end">
            <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Module</label>
                <select name="module" value={filters.module} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                   <option value="">All Modules</option>
                   <option value="User Management">User Management</option>
                   <option value="Team Management">Team Management</option>
                   <option value="Placements">Placements</option>
                   <option value="Revenue">Revenue</option>
                </select>
            </div>
            <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Action Type</label>
                <select name="action" value={filters.action} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                   <option value="">All Actions</option>
                   <option value="CREATE">Create</option>
                   <option value="UPDATE">Update</option>
                   <option value="DELETE">Delete</option>
                   <option value="USER_CREATED">User Created</option>
                   <option value="USER_UPDATED">User Updated</option>
                </select>
            </div>
            <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-2 bg-white/50 border border-white/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="md:col-span-1">
                <button onClick={applyFilters} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                    Apply Filters
                </button>
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <th className="py-3 pl-4">Date & Time</th>
                        <th className="py-3">User</th>
                        <th className="py-3">Module</th>
                        <th className="py-3">Action</th>
                        <th className="py-3">Changes (Old → New)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading && !logs.length ? (
                        <>
                            <TableRowSkeleton cols={5} />
                            <TableRowSkeleton cols={5} />
                            <TableRowSkeleton cols={5} />
                            <TableRowSkeleton cols={5} />
                            <TableRowSkeleton cols={5} />
                        </>
                    ) : logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 pl-4 text-xs text-slate-500 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3 text-sm font-medium text-slate-700">
                                {log.actor?.name || log.actorId}
                                <span className="block text-[10px] text-slate-400 font-normal">{log.actor?.role}</span>
                            </td>
                            <td className="py-3 text-sm text-slate-600">
                                <span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200">
                                    {log.module || log.entityType || 'System'}
                                </span>
                            </td>
                            <td className="py-3 text-sm text-slate-600">
                                {log.action}
                            </td>
                            <td className="py-3 text-xs text-slate-500 max-w-xs truncate">
                                {log.changes ? (
                                    <div className="group relative cursor-help">
                                        <span className="truncate block">{JSON.stringify(log.changes)}</span>
                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white p-2 rounded text-xs w-64 z-50 shadow-lg whitespace-pre-wrap">
                                            {JSON.stringify(log.changes, null, 2)}
                                        </div>
                                    </div>
                                ) : '-'}
                            </td>
                        </tr>
                    ))}
                    {!loading && logs.length === 0 && (
                        <tr><td colSpan="5" className="text-center py-8 text-slate-500">No logs found matching criteria</td></tr>
                    )}
                </tbody>
            </table>
         </div>

         {/* Pagination Controls */}
         {pagination && (
            <div className="flex items-center justify-between text-sm text-slate-600 border-t border-slate-100 pt-4 mt-4">
              <div>
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
         )}
      </div>
   </div>
  );
};

const SettingsTab = () => (
   <div className="max-w-3xl space-y-6 animate-fadeInUp">
      <div>
         <h2 className="text-2xl font-bold text-slate-800">Global System Configuration</h2>
         <p className="text-slate-500 mt-1">Manage security policies and integrations.</p>
      </div>
      
      <MfaSetup />

      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-white/60">
         <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Data Retention</h3>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Audit Log Retention (Days)</label>
               <input type="number" className="w-full px-4 py-2 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm" defaultValue="90" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Backup Frequency</label>
               <select className="w-full px-4 py-2 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Real-time (Replica)</option>
               </select>
            </div>
         </div>
      </div>
   </div>
);

const MfaSetup = () => {
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState(null);
    const [token, setToken] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [message, setMessage] = useState('');

    const startSetup = async () => {
        try {
            const res = await apiRequest('/auth/mfa/setup', { method: 'POST' });
            if(res.ok) {
                const data = await res.json();
                setQrCode(data.qrCode);
                setSecret(data.secret);
                setMessage('Scan the QR code and enter the token below.');
            }
        } catch(e) {
            setMessage('Error starting setup: ' + e.message);
        }
    };

    const verifySetup = async () => {
        try {
            const res = await apiRequest('/auth/mfa/verify', { 
                method: 'POST',
                body: JSON.stringify({ token })
            });
            if(res.ok) {
                const data = await res.json();
                if(data.success) {
                    setEnabled(true);
                    setMessage('MFA Enabled Successfully!');
                    setQrCode(null);
                } else {
                    setMessage('Invalid Token');
                }
            } else {
                setMessage('Verification failed');
            }
        } catch(e) {
            setMessage('Error: ' + e.message);
        }
    };

    return (
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-white/60">
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Multi-Factor Authentication</h3>
            
            {enabled ? (
                <div className="text-green-600 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    MFA is currently enabled for your account.
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-slate-600">Protect your account with 2-step verification.</p>
                    
                    {!qrCode ? (
                        <button onClick={startSetup} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm shadow-blue-500/30">
                            Enable MFA
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-lg inline-block shadow-sm border border-slate-100">
                                <img src={qrCode} alt="MFA QR Code" className="w-32 h-32" />
                            </div>
                            <p className="text-sm text-slate-500">Secret: <span className="font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">{secret}</span></p>
                            <div className="flex gap-2 max-w-xs">
                                <input 
                                    type="text" 
                                    value={token} 
                                    onChange={e => setToken(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="flex-1 px-4 py-2 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm"
                                />
                                <button onClick={verifySetup} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-sm shadow-green-500/30">
                                    Verify
                                </button>
                            </div>
                        </div>
                    )}
                    {message && <p className="text-sm text-slate-600 mt-2">{message}</p>}
                </div>
            )}
        </div>
    );
};

export default S1AdminDashboard;

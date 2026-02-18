import React, { useState, useEffect, useMemo } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { getRoleDisplayName, matchesRoleFilter, getDisplayNameFromFilterValue } from '../utils/roleHelpers';
import HeadPlacementsView from './HeadPlacementsView';

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
// Pie Chart Component
const PieChart = ({ percentage, size = 50, colorClass }) => {
  const radius = size / 2 - 4
  const center = size / 2
  const innerRadius = radius * 0.65 // For donut effect
  const circumference = 2 * Math.PI * radius
  
  // Cap visual fill at 100%; for 100% use two 180° arcs (SVG arc with start=end draws nothing)
  const fillPercent = Math.min(percentage, 100)
  const angle = (fillPercent / 100) * 360
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

  // Full donut path when 100%: two 180° arcs (single 360° arc has start=end and SVG omits it)
  const fullDonutPath = `M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center} ${center + radius} A ${radius} ${radius} 0 1 1 ${center} ${center - radius} L ${center} ${center - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center + innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius} Z`
  const slicePath = `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L ${innerEndX} ${innerEndY} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY} Z`
  
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
          className="text-slate-200"
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
            d={fillPercent >= 100 ? fullDonutPath : slicePath}
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
      case 'placements': return <PlacementsTab />;
      case 'audit-logs': return <AuditLogsTab />;
      case 'settings': return <SettingsTab />;
      default: return <HierarchyTab user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100/80">
      {/* Left sidebar - Premium dark sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 z-30 flex w-20 flex-col border-r border-slate-200/80 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800"
      >
        <div className="flex h-16 items-center justify-center border-b border-slate-700/80">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg"
          >
            <span className="text-sm font-bold">V</span>
          </motion.div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {[
            { id: 'hierarchy', label: 'Hierarchy', icon: 'hierarchy' },
            { id: 'members', label: 'Members', icon: 'users' },
            { id: 'l1-admins', label: 'Heads', icon: 'crown' },
            { id: 'placements', label: 'Placements', icon: 'placements' },
            { id: 'audit-logs', label: 'Audit', icon: 'log' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
          ].map((item) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 text-center transition-colors ${
                activeTab === item.id
                  ? 'bg-gradient-to-br from-violet-500/90 to-indigo-600/90 text-white shadow-lg shadow-violet-500/30'
                  : 'text-slate-400 hover:bg-slate-700/80 hover:text-white'
              }`}
              title={item.label}
            >
              {item.icon === 'hierarchy' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )}
              {item.icon === 'users' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
              {item.icon === 'crown' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
              {item.icon === 'placements' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {item.icon === 'log' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {item.icon === 'settings' && (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>
        <div className="border-t border-slate-700/80 p-2">
          <motion.button
            type="button"
            onClick={logout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex w-full flex-col items-center gap-1 rounded-xl py-3 text-slate-400 transition-colors hover:bg-slate-700/80 hover:text-white"
            title="Logout"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col pl-20">
        {/* Top bar - Premium header with dark gradient navigation */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-sm shadow-sm"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h1 className="text-xl font-bold text-slate-900">
                {activeTab === 'hierarchy' && 'Organization Hierarchy'}
                {activeTab === 'members' && 'Member Management'}
                {activeTab === 'l1-admins' && 'Head Management'}
                {activeTab === 'audit-logs' && 'Audit Logs'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="inline-flex bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full p-1.5 shadow-lg"
            >
              {[
                { id: 'hierarchy', label: 'Hierarchy' },
                { id: 'members', label: 'Members' },
                { id: 'l1-admins', label: 'Heads' },
                { id: 'audit-logs', label: 'Audit' },
                { id: 'settings', label: 'Settings' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full font-medium text-xs md:text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
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
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 pl-2 pr-4 py-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name ?? 'Admin'}</p>
                <p className="text-xs text-slate-500">{user?.role ?? 'S1_ADMIN'}</p>
              </div>
            </motion.div>
          </div>
        </motion.header>

        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const HierarchyTab = ({ user }) => {
    const navigate = useNavigate();
    const [expandedAdmins, setExpandedAdmins] = useState({});
    const [expandedTeams, setExpandedTeams] = useState({});
    const [expandedLeads, setExpandedLeads] = useState({});

    const { 
        data: hierarchyData = { superAdmins: [], unassignedTeams: [] }, 
        isLoading: loading,
        isError,
        error
    } = useQuery({
        queryKey: ['hierarchyData'],
        queryFn: async () => {
            try {
                // 1. Fetch Super Admins (Head)
                const adminsRes = await getUsers({ role: 'SUPER_ADMIN', pageSize: 100 });
                const superAdmins = adminsRes.data || [];

                // 2. Fetch All Teams Data (Full Hierarchy)
                const teamsRes = await apiRequest('/dashboard/super-admin');
                if (!teamsRes.ok) {
                    const errorText = await teamsRes.text();
                    console.error('Failed to fetch teams:', teamsRes.status, errorText);
                    throw new Error(`Failed to fetch teams: ${teamsRes.status}`);
                }
                const teamsData = await teamsRes.json();

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
                const allTeams = teamsData.teams || [];

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
            } catch (err) {
                console.error("Error in S1AdminDashboard queryFn:", err);
                throw err;
            }
        },
        placeholderData: keepPreviousData,
        retry: 1
    });

    if (isError) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 text-xl font-bold mb-4">Error loading dashboard data</div>
                <div className="text-slate-600 mb-4">{error?.message || 'Unknown error'}</div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const toggleAdmin = (adminId) => {
        setExpandedAdmins(prev => ({ ...prev, [adminId]: !prev[adminId] }));
    };

    const toggleTeam = (teamId) => {
        setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
    };

    const toggleLead = (leadId) => {
        setExpandedLeads(prev => ({ ...prev, [leadId]: !prev[leadId] }));
    };

    const handleMemberClick = (member, lead, team, forceViewParam) => {
        const isLead = member.role === 'TEAM_LEAD' || (member.level && ['L2', 'L3'].includes(member.level.toUpperCase()));
        const viewParam = forceViewParam || (isLead ? '?view=team' : '?view=personal');
        const slug = (member.name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || member.id;
        navigate(`/employee/${slug}${viewParam}`);
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
                <h3 className="text-center text-slate-500 font-medium mb-6 uppercase tracking-wider text-xs">Direct Reports (Heads)</h3>
                
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
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
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
      
      const payload = { 
        ...formData,
        yearlyTarget: formData.yearlyTarget ? Number(formData.yearlyTarget) : 0
      };
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
      alert(err.message || 'Failed to save admin');
    }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to permanently delete this admin? This action cannot be undone.")) return;
      try {
          const response = await apiRequest(`/users/${id}`, { method: 'DELETE' });
          if(!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "Failed to delete");
          }
          // Immediately remove from list and refetch
          queryClient.setQueryData(['l1Admins', { page, pageSize }], (old) => {
            if (!old || !old.data) return old;
            return {
              ...old,
              data: {
                ...old.data,
                data: (old.data.data || []).filter(a => a.id !== id),
                pagination: {
                  ...old.data.pagination,
                  total: Math.max(0, (old.data.pagination?.total || 0) - 1)
                }
              }
            };
          });
          queryClient.invalidateQueries(['l1Admins']);
      } catch (err) {
          alert(err.message || 'Failed to delete admin');
      }
  };

  const openEditModal = (admin) => {
      setEditingAdmin(admin);
      setFormData({
          name: admin.name || "",
          email: admin.email || "",
          password: "",
          role: admin.role || "SUPER_ADMIN",
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
                <h2 className="text-2xl font-bold text-slate-800">Super Admins (Head)</h2>
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
                       <th className="py-4">Status</th>
                       <th className="py-4 text-right pr-6">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/60">
                    <TableRowSkeleton cols={4} />
                    <TableRowSkeleton cols={4} />
                    <TableRowSkeleton cols={4} />
                    <TableRowSkeleton cols={4} />
                    <TableRowSkeleton cols={4} />
                 </tbody>
             </table>
          </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-fadeInUp">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">Super Admins (Head)</h2>
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
                            {getRoleDisplayName(admin.role, admin.level)}
                          </span>
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
                    <tr><td colSpan="4" className="text-center py-8 text-slate-500">No Super Admins found</td></tr>
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
       <AnimatePresence>
         {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 pointer-events-auto"
          >
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
                  onClick={() => {
                    setShowModal(false);
                    setEditingAdmin(null);
                    resetForm();
                  }}
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
            </motion.div>
          </div>
         )}
       </AnimatePresence>
    </div>
  );
};

const PlacementsTab = () => (
  <div className="p-6">
    <HeadPlacementsView allowEdit />
  </div>
);

const MembersTab = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchManagers();
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

  const fetchManagers = async () => {
    try {
      const response = await getUsers({ role: 'SUPER_ADMIN', pageSize: 100 });
      if (response.data) {
        setManagers(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch managers:", err);
    }
  };

  const handleMemberClick = (member) => {
    const isLead = member.role === 'TEAM_LEAD' || (member.level && ['L2', 'L3'].includes(member.level.toUpperCase()));
    const viewParam = isLead ? '?view=team' : '?view=personal';
    const slug = (member.name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || member.id;
    navigate(`/employee/${slug}${viewParam}`);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries(['members']);
    setShowModal(false);
    setEditingUser(null);
  };

  const { data: { data: allMembers = [], pagination } = {}, isLoading: loading } = useQuery({
    queryKey: ['members', { page }],
    queryFn: async () => {
        const params = { page, pageSize: 1000 }; // Fetch all for client-side filtering/sorting
        const res = await getUsers(params);
        // Filter out S1_ADMIN, SUPER_ADMIN, LIMITED_ACCESS (but keep inactive users for filtering)
        res.data = (res.data || []).filter(u => 
          u.role !== 'S1_ADMIN' && 
          u.role !== 'SUPER_ADMIN' &&
          u.role !== 'LIMITED_ACCESS'
        );
        return res;
    },
    placeholderData: keepPreviousData
  });

  // Client-side filtering and sorting
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = [...allMembers];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.team?.name || '').toLowerCase().includes(q) ||
        (m.manager?.name || '').toLowerCase().includes(q)
      );
    }

    // Team filter
    if (teamFilter) {
      filtered = filtered.filter(m => m.team?.id === teamFilter);
    }

    // Role filter (using role + level combination)
    if (roleFilter) {
      filtered = filtered.filter(m => matchesRoleFilter(m, roleFilter));
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === 'active') {
        filtered = filtered.filter(m => m.isActive !== false);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(m => m.isActive === false);
      }
    }

    // Level filter
    if (levelFilter) {
      filtered = filtered.filter(m => {
        const memberLevel = (m.level || '').toUpperCase();
        return memberLevel === levelFilter.toUpperCase();
      });
    }

    // Manager filter
    if (managerFilter) {
      filtered = filtered.filter(m => m.manager?.id === managerFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = (a.name || '').toLowerCase();
          bVal = (b.name || '').toLowerCase();
          break;
        case 'email':
          aVal = (a.email || '').toLowerCase();
          bVal = (b.email || '').toLowerCase();
          break;
        case 'role':
          aVal = getRoleDisplayName(a.role, a.level).toLowerCase();
          bVal = getRoleDisplayName(b.role, b.level).toLowerCase();
          break;
        case 'team':
          aVal = (a.team?.name || '').toLowerCase();
          bVal = (b.team?.name || '').toLowerCase();
          break;
        case 'status':
          aVal = a.isActive ? 1 : 0;
          bVal = b.isActive ? 1 : 0;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allMembers, searchQuery, teamFilter, roleFilter, statusFilter, levelFilter, managerFilter, sortBy, sortDir]);

  // Pagination
  const pageSize = 20;
  const totalPages = Math.ceil(filteredAndSortedMembers.length / pageSize);
  const paginatedMembers = filteredAndSortedMembers.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to permanently delete this member? This action cannot be undone.")) return;
      try {
          const response = await apiRequest(`/users/${id}`, { method: 'DELETE' });
          if(!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "Failed to delete");
          }
          // Immediately remove from list and refetch
          queryClient.setQueryData(['members', { page }], (old) => {
            if (!old) return old;
            return {
              ...old,
              data: {
                ...old.data,
                data: (old.data?.data || []).filter(m => m.id !== id)
              }
            };
          });
          // Refetch to ensure consistency
          queryClient.invalidateQueries(['members']);
      } catch (err) {
          alert(err.message || 'Failed to delete member');
      }
  };

  if (loading && !allMembers.length) return (
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
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">Team Members</h2>
             <p className="text-slate-500 mt-1">Manage all employees and team leads.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Member
          </motion.button>
       </div>

       {/* Advanced Filters */}
       <motion.div
         initial={{ opacity: 0, y: 8 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.1 }}
         className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/60 overflow-hidden"
       >
         {/* Basic Filters */}
         <div className="p-5">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="lg:col-span-2">
               <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Search</label>
               <div className="relative">
                 <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
                 <input
                   type="text"
                   value={searchQuery}
                   onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setPage(1);
                   }}
                   placeholder="Search by name, email, team, or manager..."
                   className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white/50"
                 />
               </div>
             </div>
             <div>
               <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Role</label>
               <select 
                 value={roleFilter} 
                 onChange={(e) => {
                   setRoleFilter(e.target.value);
                   setPage(1);
                 }}
                 className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white/50 text-sm"
               >
                 <option value="">All Roles</option>
                 <option value="TEAM_LEAD">Team Lead</option>
                 <option value="EMPLOYEE_L3">Senior Recruiter</option>
                 <option value="EMPLOYEE_L4">Recruiter</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Team</label>
               <select 
                 value={teamFilter} 
                 onChange={(e) => {
                   setTeamFilter(e.target.value);
                   setPage(1);
                 }}
                 className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white/50 text-sm"
               >
                 <option value="">All Teams</option>
                 {teams.map(team => (
                   <option key={team.id} value={team.id}>{team.name}</option>
                 ))}
               </select>
             </div>
           </div>

           {/* Advanced Filters Toggle */}
           <div className="mt-4 flex items-center justify-between">
             <button
               onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
               className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
             >
               <svg className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
               </svg>
               {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
             </button>
             {(searchQuery || teamFilter || roleFilter || statusFilter || levelFilter || managerFilter) && (
               <button
                 onClick={() => {
                   setSearchQuery('');
                   setRoleFilter('');
                   setTeamFilter('');
                   setStatusFilter('');
                   setLevelFilter('');
                   setManagerFilter('');
                   setPage(1);
                 }}
                 className="text-xs text-slate-500 hover:text-slate-700 font-medium underline"
               >
                 Clear all filters
               </button>
             )}
           </div>
         </div>

         {/* Advanced Filters Panel */}
         <AnimatePresence>
           {showAdvancedFilters && (
             <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.2 }}
               className="overflow-hidden border-t border-slate-200"
             >
               <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50">
                 <div>
                   <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Status</label>
                   <select 
                     value={statusFilter} 
                     onChange={(e) => {
                       setStatusFilter(e.target.value);
                       setPage(1);
                     }}
                     className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                   >
                     <option value="">All Status</option>
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Level</label>
                   <select 
                     value={levelFilter} 
                     onChange={(e) => {
                       setLevelFilter(e.target.value);
                       setPage(1);
                     }}
                     className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                   >
                     <option value="">All Levels</option>
                     <option value="L2">L2 - Team Lead</option>
                     <option value="L3">L3 - Senior Recruiter</option>
                     <option value="L4">L4 - Recruiter</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Manager</label>
                   <select 
                     value={managerFilter} 
                     onChange={(e) => {
                       setManagerFilter(e.target.value);
                       setPage(1);
                     }}
                     className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-sm"
                   >
                     <option value="">All Managers</option>
                     {managers.map(manager => (
                       <option key={manager.id} value={manager.id}>{manager.name}</option>
                     ))}
                   </select>
                 </div>
               </div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Active Filters Display */}
         {(searchQuery || teamFilter || roleFilter || statusFilter || levelFilter || managerFilter) && (
           <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
             <span className="text-xs font-medium text-slate-500">Active filters:</span>
             {searchQuery && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                 Search: {searchQuery}
                 <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">×</button>
               </span>
             )}
             {roleFilter && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-xs font-medium">
                 Role: {getDisplayNameFromFilterValue(roleFilter)}
                 <button onClick={() => setRoleFilter('')} className="hover:text-violet-900">×</button>
               </span>
             )}
             {teamFilter && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                 Team: {teams.find(t => t.id === teamFilter)?.name}
                 <button onClick={() => setTeamFilter('')} className="hover:text-emerald-900">×</button>
               </span>
             )}
             {statusFilter && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                 Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                 <button onClick={() => setStatusFilter('')} className="hover:text-green-900">×</button>
               </span>
             )}
             {levelFilter && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                 Level: {levelFilter}
                 <button onClick={() => setLevelFilter('')} className="hover:text-amber-900">×</button>
               </span>
             )}
             {managerFilter && (
               <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                 Manager: {managers.find(m => m.id === managerFilter)?.name}
                 <button onClick={() => setManagerFilter('')} className="hover:text-purple-900">×</button>
               </span>
             )}
           </div>
         )}
       </motion.div>
  
       <motion.div
         initial={{ opacity: 0, y: 8 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.15 }}
         className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/60 overflow-hidden"
       >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                     <th className="py-4 pl-6">
                       <button
                         onClick={() => toggleSort('name')}
                         className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                       >
                         Member
                         {sortBy === 'name' && (
                           <span className="text-blue-600">
                             {sortDir === 'asc' ? '↑' : '↓'}
                           </span>
                         )}
                       </button>
                     </th>
                     <th className="py-4">
                       <button
                         onClick={() => toggleSort('role')}
                         className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                       >
                         Role
                         {sortBy === 'role' && (
                           <span className="text-blue-600">
                             {sortDir === 'asc' ? '↑' : '↓'}
                           </span>
                         )}
                       </button>
                     </th>
                     <th className="py-4">
                       <button
                         onClick={() => toggleSort('team')}
                         className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                       >
                         Team
                         {sortBy === 'team' && (
                           <span className="text-blue-600">
                             {sortDir === 'asc' ? '↑' : '↓'}
                           </span>
                         )}
                       </button>
                     </th>
                     <th className="py-4">Manager</th>
                     <th className="py-4">
                       <button
                         onClick={() => toggleSort('status')}
                         className="flex items-center gap-1.5 hover:text-slate-700 transition-colors"
                       >
                         Status
                         {sortBy === 'status' && (
                           <span className="text-blue-600">
                             {sortDir === 'asc' ? '↑' : '↓'}
                           </span>
                         )}
                       </button>
                     </th>
                     <th className="py-4 text-right pr-6">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {paginatedMembers.map((member, idx) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.02, duration: 0.2 }}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                         <td className="py-4 pl-6">
                            <div className="flex items-center gap-3">
                               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-slate-700 font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                                 {member.name.charAt(0)}
                               </div>
                               <div>
                                  <span className="font-medium text-slate-800 block">{member.name}</span>
                                  <span className="text-xs text-slate-400">{member.email}</span>
                               </div>
                            </div>
                         </td>
                         <td className="py-4 text-slate-600">
                             <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                               member.role === 'TEAM_LEAD' || member.level === 'L2' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                               member.level === 'L3' ? 'bg-violet-100 text-violet-700 border-violet-200' :
                               'bg-blue-100 text-blue-700 border-blue-200'
                             }`}>
                               {getRoleDisplayName(member.role, member.level)}
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
                               <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium border border-green-200">Active</span>
                           ) : (
                               <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium border border-red-200">Inactive</span>
                           )}
                         </td>
                         <td className="py-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleMemberClick(member)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openEditModal(member)}
                                className="text-violet-600 hover:text-violet-800 text-sm font-medium px-2 py-1 rounded-lg hover:bg-violet-50 transition-colors"
                              >
                                Edit
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(member.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                Delete
                              </motion.button>
                            </div>
                         </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {paginatedMembers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-slate-500">
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="font-medium">No members found</p>
                            <p className="text-xs text-slate-400">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                  )}
               </tbody>
            </table>
          </div>
       </motion.div>

       {/* Pagination Controls */}
       {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between text-sm text-slate-600 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/60"
          >
            <div>
              Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filteredAndSortedMembers.length)} of {filteredAndSortedMembers.length} members
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors font-medium"
              >
                Previous
              </motion.button>
              <span className="px-4 py-2 text-slate-700 font-medium">
                Page {page} of {totalPages}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 rounded-xl border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors font-medium"
              >
                Next
              </motion.button>
            </div>
          </motion.div>
       )}
       
       <UserCreationModal 
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }}
          editingUser={editingUser}
          onSuccess={handleSuccess}
          teams={teams}
       />
    </motion.div>
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
    const { user } = useAuth();
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState(null);
    const [token, setToken] = useState('');
    const [disablePassword, setDisablePassword] = useState('');
    const [showDisableForm, setShowDisableForm] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Check MFA status on mount and when user changes
    useEffect(() => {
        if (user) {
            setEnabled(user.mfaEnabled || false);
            setLoading(false);
        } else {
            // Fallback to localStorage if user context not available
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setEnabled(userData.mfaEnabled || false);
                } catch (e) {
                    setEnabled(false);
                }
            }
            setLoading(false);
        }
    }, [user]);

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
                    setToken('');
                    // Update user in localStorage
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const userData = JSON.parse(storedUser);
                        userData.mfaEnabled = true;
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
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

    const handleDisableMfa = async () => {
        if (!disablePassword) {
            setMessage('Please enter your password to disable MFA');
            return;
        }

        try {
            const res = await apiRequest('/auth/mfa/disable', {
                method: 'POST',
                body: JSON.stringify({ password: disablePassword })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setEnabled(false);
                    setMessage('MFA Disabled Successfully!');
                    setDisablePassword('');
                    setShowDisableForm(false);
                    // Update user in localStorage and context
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        const userData = JSON.parse(storedUser);
                        userData.mfaEnabled = false;
                        localStorage.setItem('user', JSON.stringify(userData));
                        // Trigger a refresh by updating the component state
                        window.dispatchEvent(new Event('storage'));
                    }
                }
            } else {
                const data = await res.json().catch(() => ({}));
                setMessage(data.error || 'Failed to disable MFA');
            }
        } catch(e) {
            setMessage('Error: ' + e.message);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-white/60">
                <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Multi-Factor Authentication</h3>
                <p className="text-slate-600">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-xl shadow-sm border border-white/60">
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Multi-Factor Authentication</h3>
            
            {enabled ? (
                <div className="space-y-4">
                    <div className="text-green-600 font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        MFA is currently enabled for your account.
                    </div>
                    
                    {!showDisableForm ? (
                        <button 
                            onClick={() => setShowDisableForm(true)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition shadow-sm shadow-red-500/30"
                        >
                            Disable MFA
                        </button>
                    ) : (
                        <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-sm text-red-800 font-medium">Enter your password to disable MFA</p>
                            <div className="flex gap-2 max-w-xs">
                                <input 
                                    type="password" 
                                    value={disablePassword} 
                                    onChange={e => setDisablePassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="flex-1 px-4 py-2 bg-white border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                    autoFocus
                                />
                                <button 
                                    onClick={handleDisableMfa}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition shadow-sm shadow-red-500/30"
                                >
                                    Disable
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowDisableForm(false);
                                        setDisablePassword('');
                                        setMessage('');
                                    }}
                                    className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    {message && <p className={`text-sm mt-2 ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
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

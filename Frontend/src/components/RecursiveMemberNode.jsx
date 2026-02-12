import React, { memo } from 'react'
import PieChart from './PieChart'
import CalculationService from '../utils/calculationService'

const RecursiveMemberNode = memo(({ member, expandedMembers, toggleMember, handleMemberClick, colorClasses, lead, team, depth = 0 }) => {
  const hasChildren = member.members && member.members.length > 0
  const isExpanded = expandedMembers[member.id]
  const level = member.level || 'L4'
  const isPlacementTeam = team?.isPlacementTeam || member.targetType === 'PLACEMENTS'

  const isL3 = level === 'L3'

  // Team summary data from lead's perspective (for L2/L3 leads)
  const teamSummary = member.teamSummary || {}
  
  // Decide whether to show this node as a parent (team lead) or leaf (member)
  // L2/L3 should be treated as leaf nodes in team view to hide their personal placements/targets
  const isLeaf = !hasChildren;
  
  if (hasChildren && !isLeaf) {
    const achievedValue = isPlacementTeam 
      ? (teamSummary.placementDone || member.totalPlacements || member.placements || 0)
      : (teamSummary.revenueAch || member.totalRevenue || member.revenue || 0)

    return (
      <div className="relative animate-fadeIn">
        {/* Connector Line from Parent */}
        <div className="absolute left-[-20px] top-6 w-[20px] h-[2px] bg-slate-200/80 rounded-l-full"></div>
        
        <div 
          className={`relative z-10 bg-white/80 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl hover:shadow-md hover:border-blue-300 transition-all duration-200 group`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleMemberClick(member, lead, team)}>
              <div className={`relative ${isL3 ? 'bg-teal-500' : 'bg-blue-500'} text-white w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-700 text-sm group-hover:text-blue-700 transition-colors">{member.name} (Team)</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center">
                   <span className="font-medium text-slate-600">Total Target: <span className="text-slate-900">
                      {isPlacementTeam 
                        ? (teamSummary.yearlyPlacementTarget || member.target) 
                        : CalculationService.formatCurrency(teamSummary.yearlyRevenueTarget || member.target)}
                   </span></span>
                   <span className="mx-2 text-slate-300">|</span>
                   <span className="font-medium text-slate-600">Achieved: <span className="text-green-600">
                      {isPlacementTeam 
                        ? achievedValue 
                        : CalculationService.formatCurrency(achievedValue)}
                   </span></span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               {member.targetAchieved !== undefined && (
                 <PieChart 
                   percentage={Number(isPlacementTeam ? (teamSummary.placementAchPercent || member.targetAchieved) : (teamSummary.revenueTargetAchievedPercent || member.targetAchieved))} 
                   size={40} 
                   colorClass="text-slate-600" 
                 />
               )}
               <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-100">
                  {member.members.length}
               </span>
               <div 
                 onClick={(e) => {
                   e.stopPropagation();
                   toggleMember(member.id);
                 }}
                 className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-transform duration-300 cursor-pointer hover:bg-slate-200 ${isExpanded ? 'rotate-180 bg-blue-100 text-blue-600' : 'text-slate-400'}`}
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
            </div>
          </div>
        </div>

        {/* Self Entry for Lead Personal Data */}
        {isExpanded && (
          <div className="mt-3 ml-6 pl-6 border-l-2 border-slate-100 space-y-3">
            <div className="relative animate-fadeIn">
              <div className="absolute left-[-24px] top-1/2 w-[24px] h-[2px] bg-slate-200/80 rounded-l-full"></div>
              <div
                onClick={() => handleMemberClick(member, lead, team)}
                className="relative z-10 bg-blue-50/40 backdrop-blur-sm border border-blue-100 p-4 rounded-xl hover:border-blue-300 hover:bg-blue-50/60 hover:shadow-md transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shadow-sm group-hover:scale-110 transition-transform duration-200">
                       <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                       </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-700 group-hover:text-blue-800 transition-colors">{member.name} (Personal)</div>
                      <div className="text-[10px] text-blue-500 font-medium">Manage personal target & placements</div>
                    </div>
                  </div>
                  {member.personalSummary && (
                    <div className="flex items-center gap-2">
                      <PieChart 
                        percentage={Number(member.personalSummary.targetAchievedPercent || 0)} 
                        size={32} 
                        colorClass="text-blue-600" 
                      />
                    </div>
                  )}
                </div>

                {(member.personalSummary || member.target) && (
                  <div className="space-y-1.5 border-t border-blue-100/50 pt-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-blue-600/70 font-medium">Personal Target:</span>
                      <span className="font-semibold text-blue-800">
                        {isPlacementTeam 
                          ? (member.personalSummary?.yearlyPlacementTarget || member.target) 
                          : CalculationService.formatCurrency(member.personalSummary?.yearlyRevenueTarget || member.target)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-blue-600/70 font-medium">Achieved:</span>
                      <span className="font-semibold text-green-600">
                        {isPlacementTeam 
                          ? (member.personalSummary?.placementDone || member.placements || 0) 
                          : CalculationService.formatCurrency(member.personalSummary?.totalRevenueGenerated || member.revenue || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {member.members.map((child) => (
              <RecursiveMemberNode
                key={child.id}
                member={child}
                expandedMembers={expandedMembers}
                toggleMember={toggleMember}
                handleMemberClick={handleMemberClick}
                colorClasses={colorClasses}
                lead={lead}
                team={team}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Leaf Node
  const personalSummary = member.personalSummary || {}
  const hasPersonalSummary = !!member.personalSummary

  return (
    <div className="relative animate-fadeIn">
      {/* Connector Line from Parent */}
      <div className="absolute left-[-24px] top-1/2 w-[24px] h-[2px] bg-slate-200/80 rounded-l-full"></div>
      
      <div
        onClick={() => handleMemberClick(member, lead, team)}
        className="relative z-10 bg-white/60 backdrop-blur-sm border border-slate-100 p-4 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md transition-all duration-200 group cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="relative bg-slate-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shadow-sm group-hover:scale-110 transition-transform duration-200">
               <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
               </svg>
            </div>
            <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">{member.name}</div>
          </div>
          {(hasPersonalSummary || member.targetAchieved !== undefined) && (
             <PieChart 
               percentage={Number(hasPersonalSummary ? personalSummary.targetAchievedPercent : member.targetAchieved)} 
               size={36} 
               colorClass="text-slate-600" 
             />
          )}
        </div>
        
        <div className="space-y-1.5 border-t border-slate-100/50 pt-2">
          {(hasPersonalSummary || member.target) && (
             <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Target:</span>
                <span className="font-semibold text-slate-700">
                  {isPlacementTeam 
                    ? (hasPersonalSummary ? personalSummary.yearlyPlacementTarget : member.target) 
                    : CalculationService.formatCurrency(hasPersonalSummary ? (personalSummary.yearlyRevenueTarget || member.target) : member.target)}
                </span>
             </div>
          )}
          <div className="flex justify-between items-center text-xs">
             <span className="text-slate-500 font-medium">Achieved:</span>
             <span className="font-semibold text-green-600">
                {isPlacementTeam 
                  ? (hasPersonalSummary ? personalSummary.placementDone : (member.totalPlacements || member.placements || 0)) 
                  : CalculationService.formatCurrency(hasPersonalSummary ? personalSummary.totalRevenueGenerated : (member.totalRevenue || member.revenue || 0))}
             </span>
          </div>
        </div>
      </div>
    </div>
  )
})

export default RecursiveMemberNode

import { Role } from "../generated/client/index.js";
import prisma from "../prisma.js";

// const prisma = new PrismaClient();

function toCurrency(value) {
  return Number(value || 0);
}

export async function getSuperAdminOverview(currentUser, year) {
  try {
    console.log(`[getSuperAdminOverview] Called for ${currentUser.id} (${currentUser.role}) with year: ${year}`);
    // Fetch current user details to get the name (since req.user only has id/role)
    const userDetails = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { name: true }
    });
    console.log(`[getSuperAdminOverview] User name: ${userDetails?.name}`);
    const currentUserName = userDetails?.name || "Super Admin";

    let whereClause = { isActive: true };

  if (currentUser) {
    if (currentUser.role === Role.SUPER_ADMIN) {
      // Find teams managed by this L1 (User -> subordinates -> teamId)
      const subordinates = await prisma.user.findMany({
        where: { managerId: currentUser.id },
        select: { 
          employeeProfile: { 
            select: { teamId: true } 
          } 
        }
      });
      
      const teamIds = subordinates
        .map(s => s.employeeProfile?.teamId)
        .filter(id => id); // Remove nulls/undefined
      
      if (teamIds.length > 0) {
        whereClause = {
          isActive: true,
          id: { in: teamIds }
        };
      } else {
        // If no teams found for this L1, ensure we don't show other L1's teams.
        whereClause = {
          isActive: true,
          id: { in: [] } // Return nothing
        };
      }
    } else if (currentUser.role === Role.S1_ADMIN) {
        // S1 Admin sees all teams
        whereClause = { isActive: true };
    } else if (currentUser.role === Role.TEAM_LEAD) {
         const userProfile = await prisma.employeeProfile.findUnique({
            where: { id: currentUser.id },
            select: { teamId: true }
         });
         if (userProfile?.teamId) {
             whereClause = { isActive: true, id: userProfile.teamId };
         }
    }
  }

  const teams = await prisma.team.findMany({
    where: whereClause,
    include: {
      employees: {
        where: { isActive: true },
        include: {
          user: true,
          manager: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const employeesWithRevenue = await prisma.user.findMany({
    where: {
      role: { in: [Role.EMPLOYEE, Role.TEAM_LEAD, Role.LIMITED_ACCESS] },
      isActive: true,
    },
    include: {
      employeeProfile: true,
      placements: {
        select: {
          revenue: true,
          doj: true,
        },
      },
    },
  });

  console.log(`[getSuperAdminOverview] Found ${employeesWithRevenue.length} employees with revenue potential`);

  const revenueByEmployee = new Map();
  const placementsByEmployee = new Map();
  const availableYears = new Set();
  availableYears.add(new Date().getFullYear());
  
  for (const emp of employeesWithRevenue) {
    if (emp.employeeProfile) {
      // Collect available years from all placements
      if (emp.placements && emp.placements.length > 0) {
        emp.placements.forEach(p => {
          if (p.doj) {
            const year = new Date(p.doj).getFullYear();
            if (!isNaN(year)) {
              availableYears.add(year);
            }
          }
        });
      }
      
      // SUMMARY DATA: ALWAYS CONSOLIDATED (NO YEAR FILTER)
      // Use the aggregate values from employeeProfile if available, 
      // or calculate from all placements (unfiltered)
      const totalRev = emp.employeeProfile.totalRevenue !== null 
        ? Number(emp.employeeProfile.totalRevenue)
        : (emp.placements || []).reduce((sum, p) => sum + Number(p.revenue || 0), 0);
        
      const totalCount = emp.employeeProfile.placementsDone !== null
        ? Number(emp.employeeProfile.placementsDone)
        : (emp.placements || []).length;

      revenueByEmployee.set(emp.employeeProfile.id, totalRev);
      placementsByEmployee.set(emp.employeeProfile.id, totalCount);
    }
  }

  const yearList = Array.from(availableYears).sort((a, b) => b - a);
  console.log(`[getSuperAdminOverview] User: ${currentUser.role}, Available Years Count: ${yearList.length}, Years: ${yearList}`);

  const responseTeams = teams.map(async (team) => {
    // Build manager -> employees map for this team
    const employeesByManager = new Map();
    team.employees.forEach((emp) => {
      if (emp.managerId) {
        if (!employeesByManager.has(emp.managerId)) {
          employeesByManager.set(emp.managerId, []);
        }
        employeesByManager.get(emp.managerId).push(emp);
      }
    });

    // Recursive function to get all descendants (flattened) for calculations
    const getAllDescendants = (managerId) => {
      let descendants = [];
      const directReports = employeesByManager.get(managerId) || [];
      
      for (const report of directReports) {
        if (report.user.role === Role.EMPLOYEE) {
          descendants.push(report);
        }
        const subDescendants = getAllDescendants(report.id);
        descendants = [...descendants, ...subDescendants];
      }
      return descendants;
    };

    // Recursive function to build hierarchical structure for UI
    const buildHierarchy = async (managerId) => {
        const directReports = employeesByManager.get(managerId) || [];
        const results = [];

        for (const report of directReports) {
            const children = await buildHierarchy(report.id);
            
            let target = Number(report.yearlyTarget || 0);
            const targetType = report.targetType || (report.level === "L4" ? "PLACEMENTS" : "REVENUE");

            // --- SHEET-BACKED SUMMARY INJECTION FOR ALL LEVELS (UNFILTERED) ---
            // Fetch the latest personal summary for this member across all years
            // Enhanced: Filter by member's level for L2/L3 separation
            const personalSummaryResult = await prisma.personalPlacement.findFirst({
                where: { 
                    employeeId: report.id,
                    level: report.level || "L4"
                },
                orderBy: [
                    { placementYear: "desc" },
                    { createdAt: "desc" }
                ]
            });

            const personalSummary = personalSummaryResult ? {
                yearlyPlacementTarget: personalSummaryResult.yearlyPlacementTarget,
                placementDone: personalSummaryResult.placementDone,
                targetAchievedPercent: personalSummaryResult.targetAchievedPercent,
                totalRevenueGenerated: personalSummaryResult.totalRevenueGenerated,
                slabQualified: personalSummaryResult.slabQualified,
                totalIncentiveInr: personalSummaryResult.totalIncentiveInr,
                totalIncentivePaidInr: personalSummaryResult.totalIncentivePaidInr,
            } : null;

            // Fetch team summary if they are a lead (Latest across all years)
            let teamSummary = null;
            if (report.user.role === Role.TEAM_LEAD) {
                const ts = await prisma.teamPlacement.findFirst({
                    where: { 
                        leadId: report.id,
                        level: report.level || "L2"
                    },
                    orderBy: [
                        { placementYear: "desc" },
                        { createdAt: "desc" }
                    ]
                });
                if (ts) {
                    teamSummary = {
                        yearlyPlacementTarget: ts.yearlyPlacementTarget,
                        placementDone: ts.placementDone,
                        placementAchPercent: ts.placementAchPercent,
                        yearlyRevenueTarget: ts.yearlyRevenueTarget,
                        revenueAch: ts.revenueAch,
                        revenueTargetAchievedPercent: ts.revenueTargetAchievedPercent,
                        totalRevenueGenerated: ts.totalRevenueGenerated,
                        slabQualified: ts.slabQualified,
                        totalIncentiveInr: ts.totalIncentiveInr,
                        totalIncentivePaidInr: ts.totalIncentivePaidInr,
                    };
                }
            }

            // If user has subordinates, their target is the sum of subordinates' targets + their own target
            if (children.length > 0) {
               const matchingChildren = children.filter(c => c.targetType === targetType);
               if (matchingChildren.length > 0) {
                   target += matchingChildren.reduce((sum, child) => sum + child.target, 0);
               }
            }
            
            const ownRevenue = revenueByEmployee.get(report.id) || 0;
            const ownPlacements = placementsByEmployee.get(report.id) || 0;

            const childrenTotalRevenue = children.reduce((sum, child) => sum + (child.totalRevenue || 0), 0);
            const childrenTotalPlacements = children.reduce((sum, child) => sum + (child.totalPlacements || 0), 0);

            const totalRevenue = ownRevenue + childrenTotalRevenue;
            const totalPlacements = ownPlacements + childrenTotalPlacements;

            // Calculate percentage based on target type
            let pct = 0;
            if (targetType === "PLACEMENTS") {
                 pct = target > 0 ? Math.round((totalPlacements / target) * 100) : 0;
            } else {
                 pct = target > 0 ? Math.round((totalRevenue / target) * 100) : 0;
            }
            
            results.push({
                id: report.id,
                name: report.user.name,
                level: report.level || "L4",
                target: target,
                targetType: targetType,
                targetAchieved: pct,
                revenue: ownRevenue,
                totalRevenue: totalRevenue,
                placements: ownPlacements,
                totalPlacements: totalPlacements,
                members: children, // Recursive nesting
                personalSummary,
                teamSummary
            });
        }
        return results;
    };

    const teamLeadsPromises = team.employees
      .filter((p) => p.user.role === Role.TEAM_LEAD && p.level === "L2")
      .map(async (lead) => {
        const hierarchyMembers = await buildHierarchy(lead.id); // For UI display

      // Calculate total revenue for the lead (Own + Descendants)
      const ownRevenue = revenueByEmployee.get(lead.id) || 0;
      const ownPlacements = placementsByEmployee.get(lead.id) || 0;

      const descendantsRevenue = hierarchyMembers.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
      const descendantsPlacements = hierarchyMembers.reduce((sum, m) => sum + (m.totalPlacements || 0), 0);

      const leadTotalRevenue = ownRevenue + descendantsRevenue;
      const leadTotalPlacements = ownPlacements + descendantsPlacements;

      // Calculate Lead Target from hierarchy (Sum of direct reports' targets) + own target
      // If no reports, fallback to own target
      let leadTarget = Number(lead.yearlyTarget || 0);
      const leadTargetType = lead.targetType || (lead.level === "L4" ? "PLACEMENTS" : "REVENUE");
      
      if (hierarchyMembers.length > 0) {
         const matchingMembers = hierarchyMembers.filter(m => m.targetType === leadTargetType);
         if (matchingMembers.length > 0) {
             leadTarget += matchingMembers.reduce((sum, m) => sum + m.target, 0);
         }
      }

      let leadPercentage = 0;
      if (leadTargetType === "PLACEMENTS") {
          leadPercentage = leadTarget > 0 ? Math.round((leadTotalPlacements / leadTarget) * 100) : 0;
      } else {
          leadPercentage = leadTarget > 0 ? Math.round((leadTotalRevenue / leadTarget) * 100) : 0;
      }

      // --- SHEET-BACKED SUMMARY INJECTION (UNFILTERED) ---
      // Fetch both personal and team summaries for the lead (Latest across all years)
      // Enhanced: Filter by lead's level for L2/L3 separation
      const personalSummaryResult = await prisma.personalPlacement.findFirst({
          where: { 
            employeeId: lead.id,
            level: lead.level || "L2"
          },
          orderBy: [{ placementYear: "desc" }, { createdAt: "desc" }]
      });

      const teamSummaryResult = await prisma.teamPlacement.findFirst({
          where: { 
            leadId: lead.id,
            level: lead.level || "L2"
          },
          orderBy: [{ placementYear: "desc" }, { createdAt: "desc" }]
      });

      const personalSummary = personalSummaryResult ? {
          yearlyPlacementTarget: personalSummaryResult.yearlyPlacementTarget,
          placementDone: personalSummaryResult.placementDone,
          targetAchievedPercent: personalSummaryResult.targetAchievedPercent,
          totalRevenueGenerated: personalSummaryResult.totalRevenueGenerated,
          slabQualified: personalSummaryResult.slabQualified,
          totalIncentiveInr: personalSummaryResult.totalIncentiveInr,
          totalIncentivePaidInr: personalSummaryResult.totalIncentivePaidInr,
      } : null;

      const teamSummary = teamSummaryResult ? {
          yearlyPlacementTarget: teamSummaryResult.yearlyPlacementTarget,
          placementDone: teamSummaryResult.placementDone,
          placementAchPercent: teamSummaryResult.placementAchPercent,
          yearlyRevenueTarget: teamSummaryResult.yearlyRevenueTarget,
          revenueAch: teamSummaryResult.revenueAch,
          revenueTargetAchievedPercent: teamSummaryResult.revenueTargetAchievedPercent,
          totalRevenueGenerated: teamSummaryResult.totalRevenueGenerated,
          slabQualified: teamSummaryResult.slabQualified,
          totalIncentiveInr: teamSummaryResult.totalIncentiveInr,
          totalIncentivePaidInr: teamSummaryResult.totalIncentivePaidInr,
      } : null;

      return {
        id: lead.id,
        name: lead.user.name,
        level: lead.level || "L2",
        target: leadTarget,
        targetType: leadTargetType,
        targetAchieved: leadPercentage,
        revenue: ownRevenue,
        totalRevenue: leadTotalRevenue,
        placements: ownPlacements,
        totalPlacements: leadTotalPlacements,
        members: hierarchyMembers, // Now nested
        personalSummary: personalSummary,
        teamSummary: teamSummary
      };
    });

    const resolvedLeads = await Promise.all(teamLeadsPromises);

    const teamTarget = team.employees.reduce(
      (sum, emp) => sum + Number(emp.yearlyTarget || 0),
      0
    );

    // Determine if team is placement based (if any member has PLACEMENTS)
    const isPlacementTeam = team.employees.some(m => m.targetType === 'PLACEMENTS');

    const teamAchievedValue = team.employees.reduce((sum, emp) => {
        if (isPlacementTeam) {
             return sum + (placementsByEmployee.get(emp.id) || 0);
        } else {
             return sum + (revenueByEmployee.get(emp.id) || 0);
        }
    }, 0);

    const teamPercentage =
      teamTarget > 0 ? Math.round((teamAchievedValue / teamTarget) * 100) : 0;

    // --- TEAM SUMMARY INJECTION ---
    // For team summary, we use the first L2 lead's summary or search for team lead in team
    const teamLead = team.employees.find(e => e.user.role === Role.TEAM_LEAD && e.level === "L2");
    let teamSummary = null;
    if (teamLead) {
        const ts = await prisma.teamPlacement.findFirst({
            where: { 
                leadId: teamLead.id,
                level: "L2" // Explicitly check L2 summary for team-level display
            },
            orderBy: [{ placementYear: "desc" }, { createdAt: "desc" }]
        });
        if (ts) {
            teamSummary = {
                yearlyPlacementTarget: ts.yearlyPlacementTarget,
                placementDone: ts.placementDone,
                placementAchPercent: ts.placementAchPercent,
                yearlyRevenueTarget: ts.yearlyRevenueTarget,
                revenueAch: ts.revenueAch,
                revenueTargetAchievedPercent: ts.revenueTargetAchievedPercent,
                totalRevenueGenerated: ts.totalRevenueGenerated,
                slabQualified: ts.slabQualified,
                totalIncentiveInr: ts.totalIncentiveInr,
                totalIncentivePaidInr: ts.totalIncentivePaidInr,
            };
        }
    }

    return {
      id: team.id,
      name: team.name,
      color: team.color || "blue",
      teamTarget,
      targetAchieved: teamPercentage,
      totalRevenue: teamAchievedValue, // Contains revenue OR placements count depending on type
      isPlacementTeam, // Flag for frontend
      teamLeads: resolvedLeads,
      teamSummary
    };
  });

  const resolvedTeams = await Promise.all(responseTeams);

  const totalLeads = resolvedTeams.reduce(
    (acc, t) => acc + t.teamLeads.length,
    0
  );
  const totalMembers = resolvedTeams.reduce(
    (acc, t) =>
      acc + t.teamLeads.reduce((s, l) => s + l.members.length, 0),
    0
  );

  return {
    superUser: {
      name: currentUserName,
      level: currentUser?.role === Role.TEAM_LEAD ? "L2" : "L1",
      role: currentUser?.role === Role.S1_ADMIN ? "Global Admin" : "Super User",
    },
    summary: {
      totalTeams: teams.length,
      totalLeads,
      totalMembers,
      totalRevenue: [...revenueByEmployee.values()].reduce((a, b) => a + b, 0),
      overallTarget: teams.reduce((sum, t) => sum + (Number(t.yearlyTarget) || 0), 0), // Approximation
    },
    availableYears: yearList,
    teams: resolvedTeams,
  };
  } catch (error) {
    console.error("[getSuperAdminOverview] Error:", error);
    throw error;
  }
}

export async function getTeamLeadOverview(currentUser, year) {
  const userId = currentUser.id;

  const leadProfile = await prisma.employeeProfile.findUnique({
    where: { id: userId },
    include: { team: true, user: true },
  });

  if (!leadProfile || !leadProfile.team) {
    throw new Error("Team lead not configured");
  }

  // Fetch all employees in the team to build the full hierarchy map
  // This is necessary because L3's reports (L4s) are not direct reports of L2
  const teamEmployees = await prisma.user.findMany({
    where: {
      employeeProfile: { teamId: leadProfile.teamId },
      isActive: true,
      role: Role.EMPLOYEE, 
    },
    include: {
      employeeProfile: true,
      placements: true, // For revenue
      manager: true
    },
  });
  
  // Also fetch Team Leads in the team (including self and L3s) to build hierarchy
  const teamLeads = await prisma.user.findMany({
    where: {
      employeeProfile: { teamId: leadProfile.teamId },
      isActive: true,
      role: Role.TEAM_LEAD
    },
    include: {
        employeeProfile: true,
        placements: true
    }
  });

  // Combine for mapping
  const allTeamMembers = [...teamLeads, ...teamEmployees];

  const employeesByManager = new Map();
  const revenueByEmployee = new Map();
  const placementsByEmployee = new Map();
  const availableYears = new Set();
  availableYears.add(new Date().getFullYear());

  allTeamMembers.forEach((emp) => {
    // Build Manager Map
    if (emp.employeeProfile?.managerId) {
        if (!employeesByManager.has(emp.employeeProfile.managerId)) {
            employeesByManager.set(emp.employeeProfile.managerId, []);
        }
        employeesByManager.get(emp.employeeProfile.managerId).push(emp);
    }

    // Build Revenue Map (ALWAYS CONSOLIDATED)
    // Use aggregate values from employeeProfile if available, otherwise sum all placements
    const totalRev = emp.employeeProfile?.totalRevenue !== null 
        ? Number(emp.employeeProfile.totalRevenue)
        : (emp.placements || []).reduce((sum, p) => sum + Number(p.revenueAsLead || p.revenue || 0), 0);
        
    const totalCount = emp.employeeProfile?.placementsDone !== null
        ? Number(emp.employeeProfile.placementsDone)
        : (emp.placements || []).length;

    revenueByEmployee.set(emp.id, totalRev);
    placementsByEmployee.set(emp.id, totalCount);

    // Collect available years (even though summaries are consolidated, placement list needs years)
    if (emp.placements) {
        emp.placements.forEach(p => {
            if (p.doj) {
                availableYears.add(new Date(p.doj).getFullYear());
            }
        });
    }
  });

  // Recursive hierarchy builder (Same as in Super Admin)
  const buildHierarchy = async (managerId) => {
    const directReports = employeesByManager.get(managerId) || [];
    const results = [];

    for (const report of directReports) {
        const children = await buildHierarchy(report.id);
        
        let target = Number(report.employeeProfile?.yearlyTarget || 0);
        const targetType = report.employeeProfile?.targetType || (report.employeeProfile?.level === "L4" ? "PLACEMENTS" : "REVENUE");

        // --- SHEET-BACKED SUMMARY INJECTION (UNFILTERED) ---
        // Fetch personal summary (Latest across all years)
        // Enhanced: Filter by member's level for L2/L3 separation
        const personalSummaryResult = await prisma.personalPlacement.findFirst({
            where: { 
                employeeId: report.id,
                level: report.employeeProfile?.level || "L4"
            },
            orderBy: [{ placementYear: "desc" }, { createdAt: "desc" }]
        });

        const personalSummary = personalSummaryResult ? {
            yearlyPlacementTarget: personalSummaryResult.yearlyPlacementTarget,
            placementDone: personalSummaryResult.placementDone,
            targetAchievedPercent: personalSummaryResult.targetAchievedPercent,
            yearlyRevenueTarget: personalSummaryResult.yearlyRevenueTarget,
            revenueAch: personalSummaryResult.revenueAch,
            revenueTargetAchievedPercent: personalSummaryResult.revenueTargetAchievedPercent,
            totalRevenueGenerated: personalSummaryResult.totalRevenueGenerated,
            slabQualified: personalSummaryResult.slabQualified,
            totalIncentiveInr: personalSummaryResult.totalIncentiveInr,
            totalIncentivePaidInr: personalSummaryResult.totalIncentivePaidInr,
            individualSynopsis: personalSummaryResult.individualSynopsis,
        } : null;

        // Prioritize target from personal summary if available for selected year
        if (personalSummary) {
            if (targetType === "PLACEMENTS" && personalSummary.yearlyPlacementTarget !== null) {
                target = Number(personalSummary.yearlyPlacementTarget);
            } else if (targetType === "REVENUE" && personalSummary.yearlyRevenueTarget !== null) {
                target = Number(personalSummary.yearlyRevenueTarget);
            }
        }

        // Fetch team summary if they are a lead (Latest across all years)
        let teamSummary = null;
        if (report.user.role === Role.TEAM_LEAD) {
            const ts = await prisma.teamPlacement.findFirst({
                where: { 
                    leadId: report.id,
                    level: report.employeeProfile?.level || "L2"
                },
                orderBy: [{ placementYear: "desc" }, { createdAt: "desc" }]
            });
            if (ts) {
                teamSummary = {
                    yearlyPlacementTarget: ts.yearlyPlacementTarget,
                    placementDone: ts.placementDone,
                    placementAchPercent: ts.placementAchPercent,
                    yearlyRevenueTarget: ts.yearlyRevenueTarget,
                    revenueAch: ts.revenueAch,
                    revenueTargetAchievedPercent: ts.revenueTargetAchievedPercent,
                    totalRevenueGenerated: ts.totalRevenueGenerated,
                    slabQualified: ts.slabQualified,
                    totalIncentiveInr: ts.totalIncentiveInr,
                    totalIncentivePaidInr: ts.totalIncentivePaidInr,
                    individualSynopsis: ts.individualSynopsis,
                };
            }
        }

        // If user has subordinates, their target is the sum of subordinates' targets
        if (children.length > 0) {
            const matchingChildren = children.filter(c => c.targetType === targetType);
            if (matchingChildren.length > 0) {
                target = matchingChildren.reduce((sum, child) => sum + child.target, 0);
            }
        }
        
        const ownRevenue = revenueByEmployee.get(report.id) || 0;
        const ownPlacements = placementsByEmployee.get(report.id) || 0;

        const childrenTotalRevenue = children.reduce((sum, child) => sum + (child.totalRevenue || 0), 0);
        const childrenTotalPlacements = children.reduce((sum, child) => sum + (child.totalPlacements || 0), 0);

        const totalRevenue = ownRevenue + childrenTotalRevenue;
        const totalPlacements = ownPlacements + childrenTotalPlacements;

    // Calculate achievement percentage
    let pct = 0;
    if (targetType === "PLACEMENTS") {
        pct = target > 0 ? Math.round((totalPlacements / target) * 100) : 0;
    } else {
        pct = target > 0 ? Math.round((totalRevenue / target) * 100) : 0;
    }
    
    results.push({
            id: report.id,
            name: report.name,
            level: report.employeeProfile?.level || "L4",
            target: target,
            targetType: targetType,
            targetAchieved: pct,
            revenue: ownRevenue,
            totalRevenue: totalRevenue,
            placements: ownPlacements,
            totalPlacements: totalPlacements,
            members: children, // Recursive nesting
            personalSummary,
            teamSummary: teamSummary // Sheet-backed summary for UI display
        });
    }
    return results;
  };

  const members = await buildHierarchy(userId);

  // Calculate Lead Stats
  const ownRevenue = revenueByEmployee.get(userId) || 0;
  const ownPlacements = placementsByEmployee.get(userId) || 0;

  const descendantsRevenue = members.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
  const descendantsPlacements = members.reduce((sum, m) => sum + (m.totalPlacements || 0), 0);

  const leadTotalRevenue = ownRevenue + descendantsRevenue;
  const leadTotalPlacements = ownPlacements + descendantsPlacements;

  const leadTargetType = leadProfile.targetType || (leadProfile.level === "L4" ? "PLACEMENTS" : "REVENUE");
  let leadTarget = Number(leadProfile.yearlyTarget || 0);

  // --- LEAD SUMMARY INJECTION (UNFILTERED) ---
  // Enhanced: Filter by lead's level for L2/L3 separation
  const personalSummaryResult = await prisma.personalPlacement.findFirst({
    where: { 
      employeeId: userId,
      level: leadProfile.level || "L2"
    },
    orderBy: [{ placementYear: "desc" }, { createdAt: "desc" }]
  });

  const leadPersonalSummary = personalSummaryResult ? {
      yearlyPlacementTarget: personalSummaryResult.yearlyPlacementTarget,
      placementDone: personalSummaryResult.placementDone,
      targetAchievedPercent: personalSummaryResult.targetAchievedPercent,
      yearlyRevenueTarget: personalSummaryResult.yearlyRevenueTarget,
      revenueAch: personalSummaryResult.revenueAch,
      revenueTargetAchievedPercent: personalSummaryResult.revenueTargetAchievedPercent,
      totalRevenueGenerated: personalSummaryResult.totalRevenueGenerated,
      slabQualified: personalSummaryResult.slabQualified,
      totalIncentiveInr: personalSummaryResult.totalIncentiveInr,
      totalIncentivePaidInr: personalSummaryResult.totalIncentivePaidInr,
  } : null;

  // Prioritize lead target from personal summary if available for selected year
  if (leadPersonalSummary) {
      if (leadTargetType === "PLACEMENTS" && leadPersonalSummary.yearlyPlacementTarget !== null) {
          leadTarget = Number(leadPersonalSummary.yearlyPlacementTarget);
      } else if (leadTargetType === "REVENUE" && leadPersonalSummary.yearlyRevenueTarget !== null) {
          leadTarget = Number(leadPersonalSummary.yearlyRevenueTarget);
      }
  }

  if (members.length > 0) {
      const matchingMembers = members.filter(m => m.targetType === leadTargetType);
      if (matchingMembers.length > 0) {
        leadTarget = matchingMembers.reduce((sum, m) => sum + m.target, 0);
      }
  }

  let leadPct = 0;
  if (leadTargetType === "PLACEMENTS") {
      leadPct = leadTarget > 0 ? Math.round((leadTotalPlacements / leadTarget) * 100) : 0;
  } else {
      leadPct = leadTarget > 0 ? Math.round((leadTotalRevenue / leadTarget) * 100) : 0;
  }

  const leadSummaryResult = await prisma.teamPlacement.findFirst({
    where: { 
      leadId: userId,
      level: leadProfile.level || "L2"
    },
    orderBy: [
        { placementYear: "desc" },
        { createdAt: "desc" }
    ]
  });

  const leadTeamSummary = leadSummaryResult ? {
      yearlyPlacementTarget: leadSummaryResult.yearlyPlacementTarget,
      placementDone: leadSummaryResult.placementDone,
      placementAchPercent: leadSummaryResult.placementAchPercent,
      yearlyRevenueTarget: leadSummaryResult.yearlyRevenueTarget,
      revenueAch: leadSummaryResult.revenueAch,
      revenueTargetAchievedPercent: leadSummaryResult.revenueTargetAchievedPercent,
      totalRevenueGenerated: leadSummaryResult.totalRevenueGenerated,
      slabQualified: leadSummaryResult.slabQualified,
      totalIncentiveInr: leadSummaryResult.totalIncentiveInr,
      totalIncentivePaidInr: leadSummaryResult.totalIncentivePaidInr,
      individualSynopsis: leadSummaryResult.individualSynopsis,
  } : null;

  return {
    team: {
      id: leadProfile.team.id,
      name: leadProfile.team.name,
      color: leadProfile.team.color || "blue",
      teamTarget: leadTarget, // Use calculated lead target as team target for L2 view
      teamSummary: leadTeamSummary // Add team summary to team object for top-level display
    },
    lead: {
      id: leadProfile.id,
      name: leadProfile.user.name,
      level: leadProfile.level || "L2",
      target: leadTarget,
      targetType: leadTargetType,
      targetAchieved: leadPct,
      revenue: ownRevenue,
      totalRevenue: leadTotalRevenue,
      placements: ownPlacements,
      totalPlacements: leadTotalPlacements,
      personalSummary: leadPersonalSummary,
      teamSummary: leadTeamSummary // Also add to lead for consistency
    },
    members, // Hierarchical
    availableYears: Array.from(availableYears).sort((a, b) => b - a),
  };
}

// --- Sheet-backed personal placements for dashboards ---
export async function getPersonalPlacementOverview(userId, year) {
  const where = {
    employeeId: userId,
  };

  if (year && year !== "All") {
    const y = Number(year);
    if (!isNaN(y)) {
      where.placementYear = y;
    }
  }

  const placements = await prisma.personalPlacement.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Derive a summary snapshot for this employee (Latest across all years)
  const summaryWhere = { employeeId: userId };

  const allPlacementsForSummary = await prisma.personalPlacement.findMany({
    where: summaryWhere,
    orderBy: [
      { placementYear: "desc" },
      { createdAt: "desc" }
    ],
  });

  let summary = null;
  for (const p of allPlacementsForSummary) {
    if (
      p.yearlyPlacementTarget !== null ||
      p.placementDone !== null ||
      p.targetAchievedPercent !== null ||
      p.totalRevenueGenerated !== null ||
      p.slabQualified !== null ||
      p.totalIncentiveInr !== null ||
      p.totalIncentivePaidInr !== null ||
      p.individualSynopsis !== null
    ) {
      summary = {
        vbCode: p.vbCode,
        recruiterName: p.recruiterName,
        teamLeadName: p.teamLeadName,
        yearlyPlacementTarget: p.yearlyPlacementTarget,
        placementDone: p.placementDone,
        targetAchievedPercent: p.targetAchievedPercent,
        yearlyRevenueTarget: p.yearlyRevenueTarget,
        revenueAch: p.revenueAch,
        revenueTargetAchievedPercent: p.revenueTargetAchievedPercent,
        totalRevenueGenerated: p.totalRevenueGenerated,
        slabQualified: p.slabQualified,
        totalIncentiveInr: p.totalIncentiveInr,
        totalIncentivePaidInr: p.totalIncentivePaidInr,
        individualSynopsis: p.individualSynopsis,
      };
      break;
    }
  }

  return {
    userId,
    year: year || "All",
    placements,
    summary,
  };
}

// --- Sheet-backed team placements for dashboards ---
export async function getTeamPlacementOverview(leadId, year) {
  const where = {
    leadId,
  };

  if (year && year !== "All") {
    const y = Number(year);
    if (!isNaN(y)) {
      where.placementYear = y;
    }
  }

  const placements = await prisma.teamPlacement.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Same idea for team summary – pick a single row that carries the already-computed
  // summary snapshot fields (Latest across all years).
  const summaryWhere = { leadId };

  const allPlacementsForSummary = await prisma.teamPlacement.findMany({
    where: summaryWhere,
    orderBy: [
      { placementYear: "desc" },
      { createdAt: "desc" }
    ],
  });

  let summary = null;
  for (const p of allPlacementsForSummary) {
    if (
      p.yearlyPlacementTarget !== null ||
      p.placementDone !== null ||
      p.placementAchPercent !== null ||
      p.yearlyRevenueTarget !== null ||
      p.revenueAch !== null ||
      p.revenueTargetAchievedPercent !== null ||
      p.totalRevenueGenerated !== null ||
      p.slabQualified !== null ||
      p.totalIncentiveInr !== null ||
      p.totalIncentivePaidInr !== null ||
      p.individualSynopsis !== null
    ) {
      summary = {
        vbCode: p.vbCode,
        yearlyPlacementTarget: p.yearlyPlacementTarget,
        placementDone: p.placementDone,
        placementAchPercent: p.placementAchPercent,
        yearlyRevenueTarget: p.yearlyRevenueTarget,
        revenueAch: p.revenueAch,
        revenueTargetAchievedPercent: p.revenueTargetAchievedPercent,
        totalRevenueGenerated: p.totalRevenueGenerated,
        slabQualified: p.slabQualified,
        totalIncentiveInr: p.totalIncentiveInr,
        totalIncentivePaidInr: p.totalIncentivePaidInr,
        individualSynopsis: p.individualSynopsis,
      };
      break;
    }
  }

  return {
    leadId,
    year: year || "All",
    placements,
    summary,
  };
}


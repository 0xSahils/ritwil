import { Role } from "../generated/client/index.js";
import prisma from "../prisma.js";

// const prisma = new PrismaClient();

function toCurrency(value) {
  return Number(value || 0);
}

/** CUIDs are 25 chars and start with 'c'. */
function looksLikeCuid(value) {
  return typeof value === "string" && value.length >= 24 && value.length <= 26 && /^c[a-z0-9]+$/i.test(value);
}

/** Normalize name to URL slug (matches frontend). */
function toEmployeeSlug(name) {
  return (name ?? "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/** Resolve employee id or slug to user id (for users with employeeProfile). */
export async function resolveEmployeeId(idOrSlug) {
  if (looksLikeCuid(idOrSlug)) {
    const u = await prisma.user.findFirst({
      where: { id: idOrSlug, employeeProfile: { isNot: null } },
      select: { id: true },
    });
    if (!u) {
      const err = new Error("Employee not found");
      err.statusCode = 404;
      throw err;
    }
    return u.id;
  }
  const slug = String(idOrSlug).toLowerCase().replace(/[^a-z0-9-]/g, "");
  const users = await prisma.user.findMany({
    where: { isActive: true, employeeProfile: { isNot: null } },
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });
  const match = users.find((u) => toEmployeeSlug(u.name) === slug);
  if (!match) {
    const err = new Error("Employee not found");
    err.statusCode = 404;
    throw err;
  }
  return match.id;
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
      personalPlacements: {
        select: {
          revenueUsd: true,
          doj: true,
        },
      },
      teamPlacements: {
        select: {
          revenueLeadUsd: true,
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
      // 1. Old placements
      let filteredOldPlacements = emp.placements || [];
      
      // 2. Personal Placements
      let filteredPersonalPlacements = emp.personalPlacements || [];

      // 3. Team Placements
      let filteredTeamPlacements = emp.teamPlacements || [];

      // Collect available years from all sources
      const collectYears = (placements) => {
        placements.forEach(p => {
          if (p.doj) {
            const y = new Date(p.doj).getFullYear();
            if (!isNaN(y)) availableYears.add(y);
          }
        });
      };
      collectYears(filteredOldPlacements);
      collectYears(filteredPersonalPlacements);
      collectYears(filteredTeamPlacements);
      
      if (year && year !== 'All') {
         const targetYear = Number(year);
         const filterByYear = (p) => p.doj && new Date(p.doj).getFullYear() === targetYear;
         
         filteredOldPlacements = filteredOldPlacements.filter(filterByYear);
         filteredPersonalPlacements = filteredPersonalPlacements.filter(filterByYear);
         filteredTeamPlacements = filteredTeamPlacements.filter(filterByYear);
      }

      const oldRev = filteredOldPlacements.reduce((sum, p) => sum + Number(p.revenue || 0), 0);
      const personalRev = filteredPersonalPlacements.reduce((sum, p) => sum + Number(p.revenueUsd || 0), 0);
      const teamRev = filteredTeamPlacements.reduce((sum, p) => sum + Number(p.revenueLeadUsd || 0), 0);
      
      const totalRev = oldRev + personalRev + teamRev;
      const totalCount = filteredOldPlacements.length + filteredPersonalPlacements.length + filteredTeamPlacements.length;

      revenueByEmployee.set(emp.employeeProfile.id, totalRev);
      placementsByEmployee.set(emp.employeeProfile.id, totalCount);
    }
  }

  const yearList = Array.from(availableYears).sort((a, b) => b - a);
  console.log(`[getSuperAdminOverview] User: ${currentUser.role}, Available Years Count: ${yearList.length}, Years: ${yearList}`);

  const responseTeams = teams.map((team) => {
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
    const buildHierarchy = (managerId) => {
        const directReports = employeesByManager.get(managerId) || [];
        return directReports.map(report => {
            const children = buildHierarchy(report.id);
            
            let target = Number(report.yearlyTarget || 0);
            const targetType = report.targetType || "REVENUE";

            // If user has subordinates, their target is the sum of subordinates' targets + their own target
            // ONLY if types match. If types mismatch, we can't sum.
            if (children.length > 0) {
               // Filter children with same target type
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
            
            return {
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
                members: children // Recursive nesting
            };
        });
    };

    const leads = team.employees.filter(
      (p) => p.user.role === Role.TEAM_LEAD && p.level === "L2"
    );

    const teamLeads = leads.map((lead) => {
      const hierarchyMembers = buildHierarchy(lead.id); // For UI display

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
      const leadTargetType = lead.targetType || "REVENUE";
      
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
      };
    });

    const teamTarget = team.employees.reduce(
      (sum, emp) => sum + Number(emp.yearlyTarget || 0),
      0
    );

    // Vantage team (name contains "vant") = revenue-based; all other teams = placement-based
    const isPlacementTeam = !team.name.toLowerCase().includes('vant');

    const teamAchievedValue = team.employees.reduce((sum, emp) => {
        if (isPlacementTeam) {
             return sum + (placementsByEmployee.get(emp.id) || 0);
        } else {
             return sum + (revenueByEmployee.get(emp.id) || 0);
        }
    }, 0);

    const teamPercentage =
      teamTarget > 0 ? Math.round((teamAchievedValue / teamTarget) * 100) : 0;

    return {
      id: team.id,
      name: team.name,
      color: team.color || "blue",
      teamTarget,
      targetAchieved: teamPercentage,
      totalRevenue: teamAchievedValue, // Contains revenue OR placements count depending on type
      isPlacementTeam, // Flag for frontend
      teamLeads,
    };
  });

  const totalLeads = responseTeams.reduce(
    (acc, t) => acc + t.teamLeads.length,
    0
  );
  const totalMembers = responseTeams.reduce(
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
    teams: responseTeams,
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
      personalPlacements: true,
      teamPlacements: true,
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
        placements: true,
        personalPlacements: true,
        teamPlacements: true
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

    // Build Revenue Map
    // CRITICAL: Separation of Personal vs Team Placement data
    
    // 1. Old placements (Legacy)
    let filteredPlacements = emp.placements || [];
    if (year && year !== 'All') {
        const targetYear = Number(year);
        filteredPlacements = filteredPlacements.filter(p => p.doj && new Date(p.doj).getFullYear() === targetYear);
    }
    const oldRev = filteredPlacements.reduce((sum, p) => sum + Number(p.revenueAsLead || p.revenue || 0), 0);
    const oldCount = filteredPlacements.length;

    // 2. Personal Placements
    // For ALL users (L1-L4), personal placements are their own recruiter data
    let personalPlacements = (emp.personalPlacements || []);
    if (year && year !== 'All') {
        const targetYear = Number(year);
        personalPlacements = personalPlacements.filter(p => p.doj && new Date(p.doj).getFullYear() === targetYear);
    }
    const personalRev = personalPlacements.reduce((sum, p) => sum + Number(p.revenueUsd || 0), 0);
    const personalCount = personalPlacements.length;

    // 3. Team Placements
    // Only L2s and L3s should have team placements. 
    // L4s (Recruiters) should NOT have data in teamPlacements table.
    let teamPlacements = (emp.teamPlacements || []);
    if (year && year !== 'All') {
        const targetYear = Number(year);
        teamPlacements = teamPlacements.filter(p => p.doj && new Date(p.doj).getFullYear() === targetYear);
    }
    const teamRev = teamPlacements.reduce((sum, p) => sum + Number(p.revenueLeadUsd || 0), 0);
    const teamCount = teamPlacements.length;

    // For a specific employee's "Own" contribution in the hierarchy:
    // If they are L4, we only count personalPlacements + old legacy placements.
    // If they are L2/L3, we count personalPlacements (their own recruiting) + old legacy.
    // The "teamPlacements" are their "As Lead" revenue, which is handled in the summary 
    // but should be separated from "Own" recruiting revenue if the UI expects it.
    
    const ownRevenue = oldRev + personalRev;
    const ownPlacements = oldCount + personalCount;
    
    // Total Revenue for this specific user record (Own + Lead Revenue)
    const totalRev = ownRevenue + teamRev;
    const totalCount = ownPlacements + teamCount;

    // Collect available years from all sources
    const collectYears = (placements) => {
        placements.forEach(p => {
            if (p.doj) availableYears.add(new Date(p.doj).getFullYear());
        });
    };
    collectYears(emp.placements || []);
    collectYears(emp.personalPlacements || []);
    collectYears(emp.teamPlacements || []);

    revenueByEmployee.set(emp.id, totalRev);
    placementsByEmployee.set(emp.id, totalCount);
  });

  // Recursive hierarchy builder (Same as in Super Admin)
  const buildHierarchy = (managerId) => {
    const directReports = employeesByManager.get(managerId) || [];
    return directReports.map(report => {
        const children = buildHierarchy(report.id);
        
        let target = Number(report.employeeProfile?.yearlyTarget || 0);
        const targetType = report.employeeProfile?.targetType || "REVENUE";

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

        let pct = 0;
        if (targetType === "PLACEMENTS") {
            pct = target > 0 ? Math.round((totalPlacements / target) * 100) : 0;
        } else {
            pct = target > 0 ? Math.round((totalRevenue / target) * 100) : 0;
        }
        
        return {
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
            members: children // Recursive nesting
        };
    });
  };

  const members = buildHierarchy(userId);

  // Calculate Lead Stats
  const ownRevenue = revenueByEmployee.get(userId) || 0;
  const ownPlacements = placementsByEmployee.get(userId) || 0;

  const descendantsRevenue = members.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
  const descendantsPlacements = members.reduce((sum, m) => sum + (m.totalPlacements || 0), 0);

  const leadTotalRevenue = ownRevenue + descendantsRevenue;
  const leadTotalPlacements = ownPlacements + descendantsPlacements;

  let leadTarget = Number(leadProfile.yearlyTarget || 0);
  const leadTargetType = leadProfile.targetType || "REVENUE";

  if (members.length > 0) {
      const matchingMembers = members.filter(m => m.targetType === leadTargetType);
      if (matchingMembers.length > 0) {
        leadTarget += matchingMembers.reduce((sum, m) => sum + m.target, 0);
      }
  }

  let leadPct = 0;
  if (leadTargetType === "PLACEMENTS") {
      leadPct = leadTarget > 0 ? Math.round((leadTotalPlacements / leadTarget) * 100) : 0;
  } else {
      leadPct = leadTarget > 0 ? Math.round((leadTotalRevenue / leadTarget) * 100) : 0;
  }
  
  return {
    team: {
      id: leadProfile.team.id,
      name: leadProfile.team.name,
      color: leadProfile.team.color || "blue",
      teamTarget: leadTarget, // Use calculated lead target as team target for L2 view
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
    },
    members, // Hierarchical
  };
}

export async function getPersonalPlacementOverview(currentUser, userId) {
  try {
    // Only allow viewing another user's data for SUPER_ADMIN/S1_ADMIN; otherwise restrict to self
    let targetId = userId || currentUser.id;
    if (userId && userId !== currentUser.id) {
      const canViewOthers = currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.S1_ADMIN;
      if (!canViewOthers) {
        targetId = currentUser.id;
      }
    }

    // Fetch placement data (include summary-only rows)
    const allRows = await prisma.personalPlacement.findMany({
      where: {
        employeeId: targetId,
      },
      orderBy: { doj: "desc" },
    });

    // Prefer the summary-only row for summary; fill any nulls from other rows so frontend shows correct values
    const isSummaryRow = (p) =>
      (p.plcId && String(p.plcId).startsWith("SUMMARY-")) ||
      (p.candidateName && String(p.candidateName).trim() === "(Summary only)");
    const summaryRow = allRows.find(isSummaryRow);
    const placementList = allRows.filter((p) => !isSummaryRow(p));

    const pick = (field) => {
      const fromSummary = summaryRow?.[field];
      if (fromSummary != null && fromSummary !== "") return fromSummary;
      const fromAny = allRows.find((r) => r[field] != null && r[field] !== "");
      return fromAny?.[field] ?? null;
    };
    const placementDoneFallback = pick("placementDone");
    const summary = (summaryRow || allRows[0]) ? {
      yearlyPlacementTarget: pick("yearlyPlacementTarget"),
      placementDone: placementDoneFallback != null ? placementDoneFallback : (placementList.length > 0 ? placementList.length : null),
      targetAchievedPercent: pick("targetAchievedPercent"),
      totalRevenueGenerated: pick("totalRevenueGenerated"),
      slabQualified: pick("slabQualified"),
      totalIncentiveInr: pick("totalIncentiveInr"),
      totalIncentivePaidInr: pick("totalIncentivePaidInr"),
    } : null;

    return {
      placements: placementList.map(p => ({
        ...p,
        revenue: Number(p.revenueUsd),
        revenueAsLead: Number(p.revenueUsd),
        incentiveAmountINR: Number(p.incentiveInr),
        incentivePaidInr: Number(p.incentivePaidInr || 0),
        billedHours: p.totalBilledHours,
        recruiter: p.recruiterName,
      })),
      summary,
    };
  } catch (error) {
    console.error("[getPersonalPlacementOverview] Error:", error);
    throw error;
  }
}

export async function getTeamPlacementOverview(currentUser, leadId) {
  try {
    // Only allow viewing another lead's data for SUPER_ADMIN/S1_ADMIN, or if current user is that lead's manager
    let targetId = leadId || currentUser.id;
    if (leadId && leadId !== currentUser.id) {
      const canViewOthers = currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.S1_ADMIN;
      if (!canViewOthers) {
        const isManagerOfLead = await prisma.employeeProfile.findFirst({
          where: { userId: leadId, managerId: currentUser.id },
        });
        if (!isManagerOfLead) {
          targetId = currentUser.id;
        } else {
          targetId = leadId;
        }
      } else {
        targetId = leadId;
      }
    }

    const allRows = await prisma.teamPlacement.findMany({
      where: {
        leadId: targetId,
      },
      orderBy: { doj: "desc" },
    });

    const isSummaryOnlyRow = (p) => p.candidateName === "(Summary only)" || (p.plcId && String(p.plcId).startsWith("SUMMARY-"));
    const summaryRow = allRows.find(isSummaryOnlyRow);
    const placementList = allRows.filter((p) => !isSummaryOnlyRow(p));

    const pick = (field) => {
      const fromSummary = summaryRow?.[field];
      if (fromSummary != null && fromSummary !== "") return fromSummary;
      const fromAny = allRows.find((r) => r[field] != null && r[field] !== "");
      return fromAny?.[field] ?? null;
    };

    const summary = (summaryRow || allRows.length > 0) ? {
      yearlyPlacementTarget: pick("yearlyPlacementTarget"),
      placementDone: pick("placementDone") ?? (placementList.length > 0 ? placementList.length : null),
      placementAchPercent: pick("placementAchPercent"),
      yearlyRevenueTarget: pick("yearlyRevenueTarget"),
      revenueAch: pick("revenueAch"),
      revenueTargetAchievedPercent: pick("revenueTargetAchievedPercent"),
      totalRevenueGenerated: pick("totalRevenueGenerated"),
      slabQualified: pick("slabQualified"),
      totalIncentiveInr: pick("totalIncentiveInr"),
      totalIncentivePaidInr: pick("totalIncentivePaidInr"),
      leadName: pick("leadName"),
      splitWith: pick("splitWith"),
    } : null;

    return {
      placements: placementList.map(p => ({
        ...p,
        revenueLeadUsd: Number(p.revenueLeadUsd),
        revenue: Number(p.revenueLeadUsd),
        incentiveInr: Number(p.incentiveInr),
        incentiveAmountINR: Number(p.incentiveInr),
        incentivePaidInr: Number(p.incentivePaidInr || 0),
        totalBilledHours: p.totalBilledHours,
        billedHours: p.totalBilledHours,
        recruiter: p.recruiterName,
        teamLead: p.leadName,
        leadName: p.leadName,
        splitWith: p.splitWith,
      })),
      summary,
    };
  } catch (error) {
    console.error("[getTeamPlacementOverview] Error:", error);
    throw error;
  }
}



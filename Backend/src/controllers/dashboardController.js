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
          plcId: true,
          candidateName: true,
          placementDone: true,
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

  // Fetch summary-row placementDone so S1 Admin hierarchy matches employee profile (same source as getPersonalPlacementOverview)
  // Use User ids: EmployeeProfile.id === User.id; PersonalPlacement.employeeId references User.id; hierarchy report.id is profile id = user id
  const userIds = employeesWithRevenue.filter((e) => e.employeeProfile).map((e) => e.id);
  const summaryRows = userIds.length > 0
    ? await prisma.personalPlacement.findMany({
        where: { employeeId: { in: userIds }, plcId: { startsWith: "SUMMARY-" } },
        select: { employeeId: true, placementDone: true },
      })
    : [];
  const placementDoneByUserId = new Map();
  const toNum = (v) => {
    if (v == null || v === "") return null;
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) return Math.floor(v);
    if (typeof v === "object" && v !== null) {
      if (typeof v.toNumber === "function") {
        const n = v.toNumber();
        if (Number.isFinite(n) && n >= 0) return Math.floor(n);
      }
      if (typeof v.toString === "function") {
        const s = String(v.toString()).trim();
        if (s && s !== "[object Object]") {
          const n = parseFloat(s);
          if (Number.isFinite(n) && n >= 0) return Math.floor(n);
        }
      }
    }
    const s = String(v).trim();
    if (s === "" || s === "[object Object]") return null;
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
  };
  summaryRows.forEach((row) => {
    const done = toNum(row.placementDone);
    if (done != null) placementDoneByUserId.set(row.employeeId, done);
  });

  const revenueByEmployee = new Map();
  const placementsByEmployee = new Map();
  const availableYears = new Set();
  availableYears.add(new Date().getFullYear());
  
  for (const emp of employeesWithRevenue) {
    if (emp.employeeProfile) {
      // 1. Old placements
      let filteredOldPlacements = emp.placements || [];
      
      // 2. Personal Placements — use summary row placementDone when present (matches employee profile)
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
      // Match getPersonalPlacementOverview: summary row placementDone first, then pick from any row, then count non-summary rows (users like M Harinath may have no SUMMARY row but placementDone on a placement row)
      const isSummaryRow = (p) =>
        (p.plcId && String(p.plcId).startsWith("SUMMARY-")) || (p.candidateName && String(p.candidateName).trim() === "(Summary only)");
      let summaryDone = placementDoneByUserId.get(emp.id);
      if (summaryDone == null && (emp.personalPlacements || []).length > 0) {
        const summaryRow = emp.personalPlacements.find(isSummaryRow);
        if (summaryRow) summaryDone = toNum(summaryRow.placementDone);
        if (summaryDone == null) {
          const fromAny = emp.personalPlacements.find((r) => r.placementDone != null && r.placementDone !== "");
          if (fromAny) summaryDone = toNum(fromAny.placementDone);
        }
      }
      const personalCount =
        summaryDone != null
          ? summaryDone
          : (filteredPersonalPlacements || []).filter((p) => !isSummaryRow(p)).length;
      const totalCount = filteredOldPlacements.length + personalCount + filteredTeamPlacements.length;

      revenueByEmployee.set(emp.id, totalRev);
      placementsByEmployee.set(emp.id, totalCount);
    }
  }

  const yearList = Array.from(availableYears).sort((a, b) => b - a);
  console.log(`[getSuperAdminOverview] User: ${currentUser.role}, Available Years Count: ${yearList.length}, Years: ${yearList}`);

  // L2/L3: show target/done/% from team placement sheet (same source as getTeamPlacementOverview). Fetch all rows per lead and resolve summary in memory.
  const levelL2L3 = (e) => {
    const l = String(e.level || "").trim().toUpperCase();
    return l === "L2" || l === "L3";
  };
  const l2l3LeadIds = [...new Set(teams.flatMap((t) => t.employees.filter(levelL2L3).map((e) => e.id)))];
  const teamPlacementAllRows = l2l3LeadIds.length > 0
    ? await prisma.teamPlacement.findMany({
        where: { leadId: { in: l2l3LeadIds } },
        select: {
          leadId: true,
          plcId: true,
          candidateName: true,
          yearlyPlacementTarget: true,
          placementDone: true,
          placementAchPercent: true,
          yearlyRevenueTarget: true,
          revenueAch: true,
          revenueTargetAchievedPercent: true,
          totalRevenueGenerated: true,
        },
      })
    : [];
  const toNumTeam = (v) => {
    if (v == null || v === "") return null;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "object" && v !== null && typeof v.toNumber === "function") return v.toNumber();
    const n = parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : null;
  };
  const isSummaryOnlyRow = (p) =>
    (p.plcId && String(p.plcId).startsWith("SUMMARY-")) ||
    (p.candidateName && String(p.candidateName).trim() === "(Summary only)");
  const teamSummaryByLeadId = new Map();
  l2l3LeadIds.forEach((leadId) => {
    const rows = teamPlacementAllRows.filter((r) => r.leadId === leadId);
    if (rows.length === 0) return;
    const summaryRow = rows.find(isSummaryOnlyRow);
    const placementList = rows.filter((p) => !isSummaryOnlyRow(p));
    const pick = (field) => {
      const fromSummary = summaryRow?.[field];
      if (fromSummary != null && fromSummary !== "") return fromSummary;
      const fromAny = rows.find((r) => r[field] != null && r[field] !== "");
      return fromAny?.[field] ?? null;
    };
    const placementDoneVal = pick("placementDone");
    teamSummaryByLeadId.set(leadId, {
      yearlyPlacementTarget: toNumTeam(pick("yearlyPlacementTarget")),
      placementDone: placementDoneVal != null ? toNumTeam(placementDoneVal) : (placementList.length > 0 ? placementList.length : null),
      placementAchPercent: toNumTeam(pick("placementAchPercent")),
      yearlyRevenueTarget: toNumTeam(pick("yearlyRevenueTarget")),
      revenueAch: toNumTeam(pick("revenueAch")),
      revenueTargetAchievedPercent: toNumTeam(pick("revenueTargetAchievedPercent")),
      totalRevenueGenerated: toNumTeam(pick("totalRevenueGenerated")),
    });
  });

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

    // Vantage: same placement columns but display as revenue ($). Use placement target/done/%; isPlacementTeam false so frontend adds $.
    const isVantageTeam = team.name.toLowerCase().includes('vant');
    const isPlacementTeam = !team.name.toLowerCase().includes('vant');

    // Recursive function to build hierarchical structure for UI
    const buildHierarchy = (managerId) => {
        const directReports = employeesByManager.get(managerId) || [];
        return directReports.map(report => {
            const children = buildHierarchy(report.id);
            
            const targetType = report.targetType || "REVENUE";
            const ownRevenue = revenueByEmployee.get(report.id) || 0;
            const ownPlacements = placementsByEmployee.get(report.id) || 0;
            const childrenTotalRevenue = children.reduce((sum, child) => sum + (child.totalRevenue || 0), 0);
            const childrenTotalPlacements = children.reduce((sum, child) => sum + (child.totalPlacements || 0), 0);
            const totalPlacements = ownPlacements + childrenTotalPlacements;

            let target;
            let totalRevenue;
            let pct;
            const isL2OrL3 = levelL2L3(report);
            const teamSheetSummary = isL2OrL3 ? teamSummaryByLeadId.get(report.id) : null;

            if (teamSheetSummary) {
                // L2/L3: show only team placement sheet data (Placement Target/Done/% or Revenue Target/Achieved/%)
                if (isVantageTeam) {
                    target = Number(teamSheetSummary.yearlyRevenueTarget ?? 0);
                    totalRevenue = Number(teamSheetSummary.revenueAch ?? teamSheetSummary.totalRevenueGenerated ?? 0);
                    pct = Number(teamSheetSummary.revenueTargetAchievedPercent ?? 0);
                } else {
                    target = Number(teamSheetSummary.yearlyPlacementTarget ?? 0);
                    totalRevenue = Number(teamSheetSummary.placementDone ?? 0);
                    pct = Number(teamSheetSummary.placementAchPercent ?? 0);
                }
            } else if (isVantageTeam) {
                target = Number(report.yearlyPlacementTarget ?? report.yearlyTarget ?? 0);
                if (children.length > 0) target += children.reduce((sum, child) => sum + (child.target || 0), 0);
                totalRevenue = totalPlacements;
                pct = target > 0 ? Math.round((totalPlacements / target) * 100) : 0;
            } else {
                target = Number(report.yearlyTarget || 0);
                if (children.length > 0) {
                    const matchingChildren = children.filter(c => c.targetType === targetType);
                    if (matchingChildren.length > 0) target += matchingChildren.reduce((sum, child) => sum + child.target, 0);
                }
                totalRevenue = ownRevenue + childrenTotalRevenue;
                pct = targetType === "PLACEMENTS"
                    ? (target > 0 ? Math.round((totalPlacements / target) * 100) : 0)
                    : (target > 0 ? Math.round((totalRevenue / target) * 100) : 0);
            }

            const node = {
                id: report.id,
                name: report.user.name,
                level: report.level || "L4",
                target: target,
                targetType: targetType,
                targetAchieved: pct,
                revenue: teamSheetSummary ? (isVantageTeam ? totalRevenue : totalRevenue) : (isVantageTeam ? ownPlacements : ownRevenue),
                totalRevenue: totalRevenue,
                placements: ownPlacements,
                totalPlacements: totalPlacements,
                members: children,
            };
            if (teamSheetSummary) node.teamSummary = teamSheetSummary;
            return node;
        });
    };

    const leads = team.employees.filter(
      (p) => p.user.role === Role.TEAM_LEAD && levelL2L3(p)
    );

    const teamLeads = leads.map((lead) => {
      const hierarchyMembers = buildHierarchy(lead.id);
      const ownRevenue = revenueByEmployee.get(lead.id) || 0;
      const ownPlacements = placementsByEmployee.get(lead.id) || 0;
      const descendantsRevenue = hierarchyMembers.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
      const descendantsPlacements = hierarchyMembers.reduce((sum, m) => sum + (m.totalPlacements || 0), 0);
      const leadTargetType = lead.targetType || "REVENUE";

      let leadTarget;
      let leadTotalRevenue;
      let leadTotalPlacements = ownPlacements + descendantsPlacements;
      let leadPercentage;
      const leadSheetSummary = levelL2L3(lead) ? teamSummaryByLeadId.get(lead.id) : null;
      if (leadSheetSummary) {
        if (isVantageTeam) {
          leadTarget = Number(leadSheetSummary.yearlyRevenueTarget ?? 0);
          leadTotalRevenue = Number(leadSheetSummary.revenueAch ?? leadSheetSummary.totalRevenueGenerated ?? 0);
          leadPercentage = Number(leadSheetSummary.revenueTargetAchievedPercent ?? 0);
        } else {
          leadTarget = Number(leadSheetSummary.yearlyPlacementTarget ?? 0);
          leadTotalRevenue = Number(leadSheetSummary.placementDone ?? 0);
          leadPercentage = Number(leadSheetSummary.placementAchPercent ?? 0);
        }
      } else if (isVantageTeam) {
        leadTarget = Number(lead.yearlyPlacementTarget ?? lead.yearlyTarget ?? 0);
        if (hierarchyMembers.length > 0) leadTarget += hierarchyMembers.reduce((sum, m) => sum + (m.target || 0), 0);
        leadTotalRevenue = leadTotalPlacements;
        leadPercentage = leadTarget > 0 ? Math.round((leadTotalPlacements / leadTarget) * 100) : 0;
      } else {
        leadTotalRevenue = ownRevenue + descendantsRevenue;
        leadTarget = Number(lead.yearlyTarget || 0);
        if (hierarchyMembers.length > 0) {
          const matchingMembers = hierarchyMembers.filter(m => m.targetType === leadTargetType);
          if (matchingMembers.length > 0) leadTarget += matchingMembers.reduce((sum, m) => sum + m.target, 0);
        }
        leadPercentage = leadTargetType === "PLACEMENTS"
          ? (leadTarget > 0 ? Math.round((leadTotalPlacements / leadTarget) * 100) : 0)
          : (leadTarget > 0 ? Math.round((leadTotalRevenue / leadTarget) * 100) : 0);
      }

      const leadNode = {
        id: lead.id,
        name: lead.user.name,
        level: lead.level || "L2",
        target: leadTarget,
        targetType: leadTargetType,
        targetAchieved: leadPercentage,
        revenue: leadSheetSummary ? leadTotalRevenue : (isVantageTeam ? ownPlacements : ownRevenue),
        totalRevenue: leadTotalRevenue,
        placements: ownPlacements,
        totalPlacements: leadTotalPlacements,
        members: hierarchyMembers,
      };
      if (leadSheetSummary) leadNode.teamSummary = leadSheetSummary;
      return leadNode;
    });

    const teamTarget = isVantageTeam
      ? team.employees.reduce((sum, emp) => sum + Number(emp.yearlyPlacementTarget ?? emp.yearlyTarget ?? 0), 0)
      : team.employees.reduce((sum, emp) => sum + Number(emp.yearlyTarget || 0), 0);

    const teamAchievedValue = isVantageTeam
      ? team.employees.reduce((sum, emp) => sum + (placementsByEmployee.get(emp.id) || 0), 0)
      : isPlacementTeam
        ? team.employees.reduce((sum, emp) => sum + (placementsByEmployee.get(emp.id) || 0), 0)
        : team.employees.reduce((sum, emp) => sum + (revenueByEmployee.get(emp.id) || 0), 0);

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
  const teamUserIds = allTeamMembers.map((u) => u.id);

  // Fetch summary-row placementDone from DB so hierarchy matches employee profile (same source as getPersonalPlacementOverview)
  const summaryRows = teamUserIds.length > 0
    ? await prisma.personalPlacement.findMany({
        where: {
          employeeId: { in: teamUserIds },
          plcId: { startsWith: "SUMMARY-" },
        },
        select: { employeeId: true, placementDone: true },
      })
    : [];
  const placementDoneByUserId = new Map();
  const toNum = (v) => {
    if (v == null || v === "") return null;
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) return Math.floor(v);
    if (typeof v === "object" && v !== null) {
      if (typeof v.toNumber === "function") {
        const n = v.toNumber();
        if (Number.isFinite(n) && n >= 0) return Math.floor(n);
      }
      if (typeof v.toString === "function") {
        const s = String(v.toString()).trim();
        if (s && s !== "[object Object]") {
          const n = parseFloat(s);
          if (Number.isFinite(n) && n >= 0) return Math.floor(n);
        }
      }
    }
    const s = String(v).trim();
    if (s === "" || s === "[object Object]") return null;
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
  };
  summaryRows.forEach((row) => {
    const done = toNum(row.placementDone);
    if (done != null) placementDoneByUserId.set(row.employeeId, done);
  });

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
    // Use summary row placementDone (from sheet) so hierarchy matches employee profile; else count placement rows.
    const allPersonal = emp.personalPlacements || [];
    const isSummaryRow = (p) =>
      (p.plcId && String(p.plcId).startsWith("SUMMARY-")) ||
      (p.candidateName && String(p.candidateName).trim() === "(Summary only)");
    const summaryDoneFromDb = placementDoneByUserId.get(emp.id);
    let personalCount;
    if (summaryDoneFromDb != null) {
      personalCount = summaryDoneFromDb;
    } else {
      let personalPlacementsFiltered = allPersonal.filter((p) => !isSummaryRow(p));
      if (year && year !== 'All') {
        const targetYear = Number(year);
        personalPlacementsFiltered = personalPlacementsFiltered.filter(p => p.doj && new Date(p.doj).getFullYear() === targetYear);
      }
      personalCount = personalPlacementsFiltered.length;
    }
    let personalPlacements = allPersonal.filter((p) => !isSummaryRow(p));
    if (year && year !== 'All') {
      const targetYear = Number(year);
      personalPlacements = personalPlacements.filter(p => p.doj && new Date(p.doj).getFullYear() === targetYear);
    }
    const personalRev = personalPlacements.reduce((sum, p) => sum + Number(p.revenueUsd || 0), 0);

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
    // Only allow viewing another user's data for SUPER_ADMIN/S1_ADMIN, or if TEAM_LEAD and the user is their subordinate
    let targetId = userId || currentUser.id;
    if (userId && userId !== currentUser.id) {
      const canViewOthers = currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.S1_ADMIN;
      if (!canViewOthers) {
        if (currentUser.role === Role.TEAM_LEAD) {
          const isSubordinate = await prisma.employeeProfile.findFirst({
            where: { id: userId, managerId: currentUser.id },
          });
          if (isSubordinate) targetId = userId;
          else targetId = currentUser.id;
        } else {
          targetId = currentUser.id;
        }
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
    const toNum = (v) => {
      if (v == null || v === "") return null;
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "object" && v != null && typeof v.toNumber === "function") return v.toNumber();
      const n = parseFloat(String(v).trim());
      return Number.isFinite(n) ? n : null;
    };
    // Prefer personal placement sheet only: summary row's revenue target, then placement target (e.g. 50000). Use profile only as last resort so we never show team/aggregate (e.g. 605000) here.
    let yearlyRevenueTarget = toNum(pick("yearlyRevenueTarget"));
    if (yearlyRevenueTarget == null) {
      yearlyRevenueTarget = toNum(pick("yearlyPlacementTarget"));
    }
    if (yearlyRevenueTarget == null) {
      const profile = await prisma.employeeProfile.findUnique({
        where: { id: targetId },
        select: { yearlyRevenueTarget: true },
      });
      yearlyRevenueTarget = profile?.yearlyRevenueTarget != null ? toNum(profile.yearlyRevenueTarget) : null;
    }
    const summary = (summaryRow || allRows[0]) ? {
      yearlyPlacementTarget: pick("yearlyPlacementTarget"),
      yearlyRevenueTarget,
      placementDone: placementDoneFallback != null ? placementDoneFallback : (placementList.length > 0 ? placementList.length : null),
      targetAchievedPercent: pick("targetAchievedPercent"),
      revenueTargetAchievedPercent: pick("revenueTargetAchievedPercent"),
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
          where: { id: leadId, managerId: currentUser.id },
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



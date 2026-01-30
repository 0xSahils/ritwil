import pkg from "@prisma/client";
import prisma from "../prisma.js";

const { Role } = pkg;
// const prisma = new PrismaClient();

function toCurrency(value) {
  return Number(value || 0);
}

export async function getSuperAdminOverview(currentUser) {
  // Fetch current user details to get the name (since req.user only has id/role)
  const userDetails = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { name: true }
  });
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
        },
      },
    },
  });

  const revenueByEmployee = new Map();
  const placementsByEmployee = new Map();
  
  for (const emp of employeesWithRevenue) {
    if (emp.employeeProfile) {
      const totalRev = emp.placements.reduce(
        (sum, p) => sum + Number(p.revenue || 0),
        0
      );
      // Count placements (assuming each entry in placements array is one placement)
      // Filter out cancelled? The query doesn't filter status.
      // Assuming all fetched placements count, or maybe filter by qualified?
      // For now, count all.
      const totalCount = emp.placements.length; 

      revenueByEmployee.set(emp.employeeProfile.id, totalRev);
      placementsByEmployee.set(emp.employeeProfile.id, totalCount);
    }
  }

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
    teams: responseTeams,
  };
}

export async function getTeamLeadOverview(currentUser) {
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

  allTeamMembers.forEach((emp) => {
    // Build Manager Map
    if (emp.employeeProfile?.managerId) {
        if (!employeesByManager.has(emp.employeeProfile.managerId)) {
            employeesByManager.set(emp.employeeProfile.managerId, []);
        }
        employeesByManager.get(emp.employeeProfile.managerId).push(emp);
    }

    // Build Revenue Map
    const totalRev = (emp.placements || []).reduce(
        (sum, p) => sum + Number(p.revenueAsLead || p.revenue || 0),
        0
    );
    const totalCount = (emp.placements || []).length;

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
        leadTarget = matchingMembers.reduce((sum, m) => sum + m.target, 0);
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


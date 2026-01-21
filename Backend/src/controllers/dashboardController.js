import pkg from "@prisma/client";

const { PrismaClient, Role } = pkg;
const prisma = new PrismaClient();

function toCurrency(value) {
  return Number(value || 0);
}

export async function getSuperAdminOverview(currentUser) {
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
      role: Role.EMPLOYEE,
      isActive: true,
    },
    include: {
      employeeProfile: true,
      placements: true,
    },
  });

  const revenueByEmployee = new Map();
  for (const emp of employeesWithRevenue) {
    const total = emp.placements.reduce(
      (sum, p) => sum + Number(p.revenue || 0),
      0
    );
    revenueByEmployee.set(emp.employeeProfile.id, total); // Note: Map key should be employeeProfile.id as used in team mapping
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
            const target = Number(report.yearlyTarget || 0);
            
            const ownRevenue = revenueByEmployee.get(report.id) || 0;
            const childrenTotalRevenue = children.reduce((sum, child) => sum + (child.totalRevenue || 0), 0);
            const totalRevenue = ownRevenue + childrenTotalRevenue;

            const pct = target > 0 ? Math.round((totalRevenue / target) * 100) : 0;
            
            return {
                id: report.id,
                name: report.user.name,
                level: report.level || "L4",
                target: target,
                targetAchieved: pct,
                revenue: ownRevenue,
                totalRevenue: totalRevenue,
                members: children // Recursive nesting
            };
        });
    };

    const leads = team.employees.filter(
      (p) => p.user.role === Role.TEAM_LEAD && p.level === "L2"
    );

    const teamLeads = leads.map((lead) => {
      const hierarchyMembers = buildHierarchy(lead.id); // For UI display

      const leadTarget = lead.yearlyTarget;
      
      // Calculate total revenue for the lead (Own + Descendants)
      // We can use the hierarchyMembers to sum up, but we need to include the lead's own revenue too.
      // The hierarchyMembers array contains direct reports (L3/L4). Each of them has 'totalRevenue'.
      const ownRevenue = revenueByEmployee.get(lead.id) || 0;
      const descendantsRevenue = hierarchyMembers.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
      const leadTotalRevenue = ownRevenue + descendantsRevenue;

      const leadPercentage =
        leadTarget && Number(leadTarget) > 0
          ? Math.round((leadTotalRevenue / Number(leadTarget)) * 100)
          : 0;

      return {
        id: lead.id,
        name: lead.user.name,
        level: lead.level || "L2",
        target: Number(leadTarget || 0),
        targetAchieved: leadPercentage,
        revenue: ownRevenue,
        totalRevenue: leadTotalRevenue,
        members: hierarchyMembers, // Now nested
      };
    });

    const teamTarget = teamLeads.reduce(
      (sum, l) => sum + toCurrency(l.target),
      0
    );
    const teamRevenue = teamLeads.reduce(
      (sum, l) => sum + l.totalRevenue,
      0
    );
    const teamPercentage =
      teamTarget > 0 ? Math.round((teamRevenue / teamTarget) * 100) : 0;

    return {
      id: team.id,
      name: team.name,
      color: team.color || "blue",
      teamTarget,
      targetAchieved: teamPercentage,
      totalRevenue: teamRevenue, // Add this for frontend
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
      name: currentUser ? currentUser.name : "Alok Mishra",
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

  allTeamMembers.forEach((emp) => {
    // Build Manager Map
    if (emp.employeeProfile?.managerId) {
        if (!employeesByManager.has(emp.employeeProfile.managerId)) {
            employeesByManager.set(emp.employeeProfile.managerId, []);
        }
        employeesByManager.get(emp.employeeProfile.managerId).push(emp);
    }

    // Build Revenue Map
    const total = (emp.placements || []).reduce(
        (sum, p) => sum + Number(p.revenue || 0),
        0
    );
    revenueByEmployee.set(emp.id, total);
  });

  // Recursive hierarchy builder (Same as in Super Admin)
  const buildHierarchy = (managerId) => {
    const directReports = employeesByManager.get(managerId) || [];
    return directReports.map(report => {
        const children = buildHierarchy(report.id);
        const target = Number(report.employeeProfile?.yearlyTarget || 0);
        
        const ownRevenue = revenueByEmployee.get(report.id) || 0;
        const childrenTotalRevenue = children.reduce((sum, child) => sum + (child.totalRevenue || 0), 0);
        const totalRevenue = ownRevenue + childrenTotalRevenue;

        const pct = target > 0 ? Math.round((totalRevenue / target) * 100) : 0;
        
        return {
            id: report.id,
            name: report.name,
            level: report.employeeProfile?.level || "L4",
            target: target,
            targetAchieved: pct,
            revenue: ownRevenue,
            totalRevenue: totalRevenue,
            members: children // Recursive nesting
        };
    });
  };

  const members = buildHierarchy(userId);

  // Calculate Lead Stats
  const ownRevenue = revenueByEmployee.get(userId) || 0;
  const descendantsRevenue = members.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
  const leadTotalRevenue = ownRevenue + descendantsRevenue;

  const leadTarget = Number(leadProfile.yearlyTarget || 0);
  const leadPct = leadTarget > 0 ? Math.round((leadTotalRevenue / leadTarget) * 100) : 0;

  return {
    team: {
      id: leadProfile.team.id,
      name: leadProfile.team.name,
      color: leadProfile.team.color || "blue",
      teamTarget: Number(leadProfile.team.yearlyTarget || 0),
    },
    lead: {
      id: leadProfile.id,
      name: leadProfile.user.name,
      level: leadProfile.level || "L2",
      target: leadTarget,
      targetAchieved: leadPct,
      revenue: ownRevenue,
      totalRevenue: leadTotalRevenue,
    },
    members, // Hierarchical
  };
}


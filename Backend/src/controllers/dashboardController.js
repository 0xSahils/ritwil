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
        // If no teams found for this L1, return empty (or handle as S1_ADMIN fallback?)
        // If Alok has 3 teams, they should be found here.
        // If S1_ADMIN logs in, they might have role S1_ADMIN.
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

    // Recursive function to get all descendants
    const getAllDescendants = (managerId) => {
      let descendants = [];
      const directReports = employeesByManager.get(managerId) || [];
      
      for (const report of directReports) {
        if (report.user.role === Role.EMPLOYEE) {
          descendants.push(report);
        }
        // Recursively find descendants of this report (e.g. L3's members)
        // report.id is the User.id (which is also EmployeeProfile.id)
        const subDescendants = getAllDescendants(report.id);
        descendants = [...descendants, ...subDescendants];
      }
      return descendants;
    };

    const leads = team.employees.filter(
      (p) => p.user.role === Role.TEAM_LEAD
    );

    const teamLeads = leads.map((lead) => {
      const members = getAllDescendants(lead.id);

      const leadTarget = lead.yearlyTarget;
      const leadRevenue = members.reduce((sum, m) => {
        return sum + (revenueByEmployee.get(m.id) || 0);
      }, 0);

      const leadPercentage =
        leadTarget && Number(leadTarget) > 0
          ? Math.round((leadRevenue / Number(leadTarget)) * 100)
          : 0;

      const formattedMembers = members.map((m) => {
        const target = Number(m.yearlyTarget || 0);
        const revenue = revenueByEmployee.get(m.id) || 0;
        const pct = target > 0 ? Math.round((revenue / target) * 100) : 0;

        return {
          id: m.id,
          name: m.user.name,
          level: m.level || "L4",
          target: target,
          targetAchieved: pct,
          revenue,
        };
      });

      return {
        id: lead.id,
        name: lead.user.name,
        level: lead.level || "L2",
        target: Number(leadTarget || 0),
        targetAchieved: leadPercentage,
        members: formattedMembers,
      };
    });

    const teamTarget = teamLeads.reduce(
      (sum, l) => sum + toCurrency(l.target),
      0
    );
    const teamRevenue = teamLeads.reduce(
      (sum, l) => sum + l.members.reduce((s, m) => s + m.revenue, 0),
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
    teams: responseTeams,
    stats: {
      totalTeams: responseTeams.length,
      totalLeads,
      totalMembers,
    },
  };
}


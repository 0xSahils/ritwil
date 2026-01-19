import pkg from "@prisma/client";

const { PrismaClient, Role } = pkg;
const prisma = new PrismaClient();

function toCurrency(value) {
  return Number(value || 0);
}

export async function getSuperAdminOverview() {
  const teams = await prisma.team.findMany({
    where: { isActive: true },
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
      dailyEntries: true,
    },
  });

  const revenueByEmployee = new Map();
  for (const emp of employeesWithRevenue) {
    const total = emp.dailyEntries.reduce(
      (sum, e) => sum + Number(e.revenue),
      0
    );
    revenueByEmployee.set(emp.id, total);
  }

  const responseTeams = teams.map((team) => {
    const leads = team.employees.filter(
      (p) => p.user.role === Role.TEAM_LEAD
    );

    const teamLeads = leads.map((lead) => {
      const members = team.employees.filter(
        (p) => p.managerId === lead.id && p.user.role === Role.EMPLOYEE
      );

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
      name: "Alok Mishra",
      level: "L1",
      role: "Super User",
    },
    teams: responseTeams,
    stats: {
      totalTeams: responseTeams.length,
      totalLeads,
      totalMembers,
    },
  };
}


import pkg from "@prisma/client";

const { PrismaClient, Role } = pkg;

const prisma = new PrismaClient();

export async function listTeamsWithMembers() {
  const teams = await prisma.team.findMany({
    where: { isActive: true },
    include: {
      employees: {
        where: { isActive: true },
        include: {
          user: {
            include: {
              dailyEntries: true,
            },
          },
          manager: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const data = teams.map((team) => {
    const leads = team.employees.filter(
      (p) => p.user.role === Role.TEAM_LEAD
    );
    const members = team.employees.filter(
      (p) => p.user.role === Role.EMPLOYEE
    );

    // Calculate aggregated stats
    const aggregatedTarget = leads.reduce(
      (sum, lead) => sum + Number(lead.yearlyTarget || 0),
      0
    );

    const aggregatedRevenue = members.reduce((total, member) => {
      const memberRevenue = member.user.dailyEntries.reduce(
        (sum, entry) => sum + Number(entry.revenue || 0),
        0
      );
      return total + memberRevenue;
    }, 0);

    return {
      id: team.id,
      name: team.name,
      color: team.color,
      yearlyTarget: aggregatedTarget, // Use aggregated target from leads
      totalRevenue: aggregatedRevenue, // Add calculated revenue
      leads: leads.map((p) => ({
        id: p.id,
        userId: p.user.id,
        name: p.user.name,
        level: p.level,
        target: Number(p.yearlyTarget || 0),
      })),
      members: members.map((p) => ({
        id: p.id,
        userId: p.user.id,
        name: p.user.name,
        level: p.level,
        revenue: p.user.dailyEntries.reduce(
          (sum, e) => sum + Number(e.revenue || 0),
          0
        ),
      })),
    };
  });

  return data;
}

export async function createTeam(payload, actorId) {
  const { name, description, color, yearlyTarget } = payload;

  if (!name) {
    const error = new Error("Team name is required");
    error.statusCode = 400;
    throw error;
  }

  const target = yearlyTarget || 0;

  const team = await prisma.team.create({
    data: {
      name,
      color: color || "blue",
      yearlyTarget: target,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "TEAM_CREATED",
      entityType: "Team",
      entityId: team.id,
      changes: {
        name: team.name,
        color: team.color,
        yearlyTarget: team.yearlyTarget,
      },
    },
  });

  return team;
}

export async function deleteTeam(id, actorId) {
  const activeEmployees = await prisma.employeeProfile.count({
    where: { teamId: id, isActive: true },
  });

  if (activeEmployees > 0) {
    const error = new Error("Cannot delete team with active employees");
    error.statusCode = 400;
    throw error;
  }

  const team = await prisma.team.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "TEAM_DELETED",
      entityType: "Team",
      entityId: id,
      changes: {
        isActive: false,
      },
    },
  });

  return team;
}

export async function bulkAssignEmployeesToTeam(teamId, userIds, actorId) {
  const employees = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      role: { in: [Role.TEAM_LEAD, Role.EMPLOYEE] },
    },
    include: { employeeProfile: true },
  });

  await Promise.all(
    employees.map((user) =>
      prisma.employeeProfile.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          teamId,
          managerId: user.employeeProfile?.managerId || null,
          level: user.employeeProfile?.level || null,
          yearlyTarget: user.employeeProfile?.yearlyTarget || 0,
          isActive: true,
        },
        update: {
          teamId,
        },
      })
    )
  );

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "TEAM_MEMBERS_ASSIGNED",
      entityType: "Team",
      entityId: teamId,
      changes: {
        userIds,
      },
    },
  });
}

export async function getTeamDetails(id) {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      employees: {
        where: { isActive: true },
        include: {
          user: {
            include: {
              dailyEntries: true,
            },
          },
          manager: true, // Manager is a User model, no need to include user again
        },
      },
    },
  });

  if (!team) {
    const error = new Error("Team not found");
    error.statusCode = 404;
    throw error;
  }

  const leads = team.employees.filter(
    (p) => p.user.role === Role.TEAM_LEAD
  );
  const members = team.employees.filter(
    (p) => p.user.role === Role.EMPLOYEE
  );

  const aggregatedTarget = leads.reduce(
    (sum, lead) => sum + Number(lead.yearlyTarget || 0),
    0
  );

  const aggregatedRevenue = members.reduce((total, member) => {
    const memberRevenue = member.user.dailyEntries.reduce(
      (sum, entry) => sum + Number(entry.revenue || 0),
      0
    );
    return total + memberRevenue;
  }, 0);

  return {
    id: team.id,
    name: team.name,
    color: team.color,
    yearlyTarget: aggregatedTarget,
    totalRevenue: aggregatedRevenue,
    leads: leads.map((p) => ({
      id: p.id,
      userId: p.user.id,
      name: p.user.name,
      email: p.user.email,
      role: p.user.role,
      level: p.level,
      target: Number(p.yearlyTarget || 0),
      revenue: p.user.dailyEntries.reduce(
        (sum, e) => sum + Number(e.revenue || 0),
        0
      ),
      joinedAt: p.createdAt,
    })),
    members: members.map((p) => ({
      id: p.id,
      userId: p.user.id,
      name: p.user.name,
      email: p.user.email,
      role: p.user.role,
      level: p.level,
      target: Number(p.yearlyTarget || 0),
      managerName: p.manager?.name || null,
      managerId: p.managerId,
      revenue: p.user.dailyEntries.reduce(
        (sum, e) => sum + Number(e.revenue || 0),
        0
      ),
      joinedAt: p.createdAt,
    })),
  };
}

export async function removeMemberFromTeam(teamId, userId, actorId) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { id: userId },
  });

  if (!profile || profile.teamId !== teamId) {
    const error = new Error("User is not in this team");
    error.statusCode = 400;
    throw error;
  }

  // If it's a lead, check if they have assignees?
  // For now, just unassign.
  
  await prisma.employeeProfile.update({
    where: { id: userId },
    data: {
      teamId: null,
      managerId: null, // Also remove manager assignment if leaving team
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "TEAM_MEMBER_REMOVED",
      entityType: "Team",
      entityId: teamId,
      changes: {
        userId,
      },
    },
  });
}

export async function updateMemberTarget(userId, target, actorId) {
  const profile = await prisma.employeeProfile.update({
    where: { id: userId },
    data: {
      yearlyTarget: target,
    },
    include: { user: true }
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "TARGET_UPDATED",
      entityType: "User",
      entityId: userId,
      changes: {
        yearlyTarget: target,
      },
    },
  });

  return profile;
}

export async function updateMemberManager(userId, managerId, actorId) {
    // Verify manager is in the same team or allowed?
    // For simplicity, just update.
    await prisma.employeeProfile.update({
        where: { id: userId },
        data: { managerId }
    });
}

export async function assignTeamLead(teamId, userId, actorId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employeeProfile: true },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.employeeProfile) {
    await prisma.employeeProfile.create({
      data: {
        id: user.id,
        teamId,
        level: "L2",
        yearlyTarget: 0,
        isActive: true,
      },
    });
  } else {
    await prisma.employeeProfile.update({
      where: { id: user.id },
      data: {
        teamId,
      },
    });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      role: Role.TEAM_LEAD,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "TEAM_LEAD_ASSIGNED",
      entityType: "Team",
      entityId: teamId,
      changes: {
        userId: updated.id,
      },
    },
  });

  return updated;
}



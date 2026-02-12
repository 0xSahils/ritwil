import { Role } from "../generated/client/index.js";
import prisma from "../prisma.js";

// const prisma = new PrismaClient();

export async function listTeamsWithMembers(currentUser) {
  let whereClause = { isActive: true };

  if (currentUser && currentUser.role === Role.SUPER_ADMIN) {
    // Filter teams for L1 Super Admin
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
        // Returning an empty list or a query that returns nothing.
        // If we leave whereClause as isActive: true, it shows ALL teams.
        // We must restrict it.
        whereClause = {
            isActive: true,
            id: { in: [] } // Impossible condition to return empty list
        };
    }
  }

  const teams = await prisma.team.findMany({
    where: whereClause,
    include: {
      employees: {
        where: { isActive: true },
        include: {
          user: {
            include: {
              placements: true,
              personalPlacements: true,
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
  // Treat L2/L3 leads as "members" as well so they show up
  // in the Team Members section for management and personal uploads.
  const members = team.employees.filter((p) => {
    if (p.user.role === Role.EMPLOYEE) return true;
    if (p.user.role === Role.TEAM_LEAD) {
      const lvl = (p.level || "").toUpperCase();
      return lvl === "L2" || lvl === "L3";
    }
    return false;
  });

    // Calculate aggregated stats
    // Update: Aggregated Target should be sum of ALL team members (L4 + L3 + L2) targets
    const aggregatedTarget = team.employees.reduce(
      (sum, member) => sum + Number(member.yearlyTarget || 0),
      0
    );

    const aggregatedRevenue = team.employees.reduce((total, member) => {
      const combinedPlacements = [
        ...(member.user.placements || []),
        ...(member.user.personalPlacements || [])
      ];
      const memberRevenue = combinedPlacements.reduce(
        (sum, entry) => sum + Number(entry.revenue || entry.revenueUsd || 0),
        0
      );
      return total + memberRevenue;
    }, 0);

    const aggregatedPlacementsCount = team.employees.reduce((total, member) => {
      const combinedCount = (member.user.placements?.length || 0) + (member.user.personalPlacements?.length || 0);
      return total + combinedCount;
    }, 0);

    // Determine team target type from members (default to REVENUE)
    // If any member has PLACEMENTS, the team is likely PLACEMENTS
    const targetType = team.employees.some(m => m.targetType === 'PLACEMENTS') ? 'PLACEMENTS' : 'REVENUE';

    return {
      id: team.id,
      name: team.name,
      color: team.color,
      yearlyTarget: aggregatedTarget, // Use aggregated target from leads
      targetType,
      totalRevenue: aggregatedRevenue, // Add calculated revenue
      totalPlacements: aggregatedPlacementsCount,
      leads: leads.map((p) => ({
        id: p.id,
        userId: p.user.id,
        name: p.user.name,
        level: p.level,
        target: Number(p.yearlyTarget || 0),
        targetType: p.targetType,
      })),
      members: members.map((p) => ({
        id: p.id,
        userId: p.user.id,
        name: p.user.name,
        level: p.level,
        target: Number(p.yearlyTarget || 0),
        targetType: p.targetType,
        revenue: (p.user.placements || []).reduce(
          (sum, e) => sum + Number(e.revenue || 0),
          0
        ) + (p.user.personalPlacements || []).reduce(
          (sum, e) => sum + Number(e.revenueUsd || 0),
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

export async function updateTeam(id, payload, actorId) {
  const { name, color, yearlyTarget, targetType } = payload;
  const data = {};
  if (name !== undefined) data.name = name;
  if (color !== undefined) data.color = color;
  if (yearlyTarget !== undefined) data.yearlyTarget = yearlyTarget;

  const team = await prisma.team.update({
    where: { id },
    data,
  });

  // Handle Target Type Propagation
  if (targetType) {
    // 1. Fetch all members
    const members = await prisma.employeeProfile.findMany({
      where: { teamId: id }
    });

    // 2. Update each member
    await Promise.all(members.map(async (member) => {
      let newTarget = member.yearlyTarget;

      // Logic: If switching to PLACEMENTS, ensure target is reasonable (default to 10 if 0 or high revenue number)
      if (targetType === 'PLACEMENTS') {
        const currentTarget = Number(member.yearlyTarget || 0);
        if (currentTarget === 0 || currentTarget > 500) {
           newTarget = 10;
        }
      }

      await prisma.employeeProfile.update({
        where: { id: member.id },
        data: {
          targetType: targetType,
          yearlyTarget: newTarget
        }
      });
    }));
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "TEAM_UPDATED",
      entityType: "Team",
      entityId: id,
      changes: { name, color, yearlyTarget, targetType },
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

export async function bulkAssignEmployeesToTeam(teamId, userIds, actorId, options = {}) {
  const { managerId, yearlyTarget } = options;

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
          managerId: managerId || user.employeeProfile?.managerId || null,
          level: user.employeeProfile?.level || null,
          yearlyTarget: yearlyTarget !== undefined ? yearlyTarget : (user.employeeProfile?.yearlyTarget || 0),
          isActive: true,
        },
        update: {
          teamId,
          ...(managerId !== undefined && { managerId }),
          ...(yearlyTarget !== undefined && { yearlyTarget }),
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
        managerId,
        yearlyTarget,
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
              placements: true,
              personalPlacements: true,
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
  // Treat L2/L3 leads as "members" as well so they show up
  // in the Team Members section for management and personal uploads.
  const members = team.employees.filter((p) => {
    if (p.user.role === Role.EMPLOYEE) return true;
    if (p.user.role === Role.TEAM_LEAD) {
      const lvl = (p.level || "").toUpperCase();
      return lvl === "L2" || lvl === "L3";
    }
    return false;
  });

  // Fetch team placements for all leads
  const leadIds = leads.map(l => l.user.id);
  const teamPlacements = leadIds.length > 0 ? await prisma.teamPlacement.findMany({
    where: {
      leadId: { in: leadIds },
    },
  }) : [];

  // Group team placements by leadId
  const teamPlacementsByLead = new Map();
  teamPlacements.forEach(tp => {
    if (!teamPlacementsByLead.has(tp.leadId)) {
      teamPlacementsByLead.set(tp.leadId, []);
    }
    teamPlacementsByLead.get(tp.leadId).push(tp);
  });

  const aggregatedTarget = team.employees.reduce(
    (sum, member) => sum + Number(member.yearlyTarget || 0),
    0
  );

  const aggregatedRevenue = team.employees.reduce((total, member) => {
    const combinedPlacements = [
      ...(member.user.placements || []),
      ...(member.user.personalPlacements || [])
    ];
    const memberRevenue = combinedPlacements.reduce(
      (sum, entry) => sum + Number(entry.revenue || entry.revenueUsd || 0),
      0
    );
    
    // For leads, also add team placement revenue
    if (member.user.role === Role.TEAM_LEAD) {
      const leadTeamPlacements = teamPlacementsByLead.get(member.user.id) || [];
      const teamRevenue = leadTeamPlacements.reduce(
        (sum, tp) => sum + Number(tp.revenueLeadUsd || 0),
        0
      );
      return total + memberRevenue + teamRevenue;
    }
    
    return total + memberRevenue;
  }, 0);

  const aggregatedPlacementsCount = team.employees.reduce((total, member) => {
    const combinedPlacements = [
      ...(member.user.placements || []),
      ...(member.user.personalPlacements || [])
    ];
    let count = combinedPlacements.length;
    
    // For leads, also add team placement count
    if (member.user.role === Role.TEAM_LEAD) {
      const leadTeamPlacements = teamPlacementsByLead.get(member.user.id) || [];
      count += leadTeamPlacements.length;
    }
    
    return total + count;
  }, 0);

  // Determine team target type from members (default to REVENUE)
  const targetType = team.employees.some(m => m.targetType === 'PLACEMENTS') ? 'PLACEMENTS' : 'REVENUE';

  return {
    id: team.id,
    name: team.name,
    color: team.color,
    yearlyTarget: aggregatedTarget,
    targetType,
    totalRevenue: aggregatedRevenue,
    totalPlacements: aggregatedPlacementsCount,
    leads: leads.map((p) => {
      const combinedPlacements = [
        ...(p.user.placements || []),
        ...(p.user.personalPlacements || [])
      ];
      const personalRevenue = combinedPlacements.reduce(
        (sum, e) => sum + Number(e.revenue || e.revenueUsd || 0),
        0
      );
      const personalPlacementsCount = combinedPlacements.length;
      
      // Add team placements for this lead
      const leadTeamPlacements = teamPlacementsByLead.get(p.user.id) || [];
      const teamRevenue = leadTeamPlacements.reduce(
        (sum, tp) => sum + Number(tp.revenueLeadUsd || 0),
        0
      );
      const teamPlacementsCount = leadTeamPlacements.length;
      
      return {
        id: p.id,
        userId: p.user.id,
        name: p.user.name,
        email: p.user.email,
        role: p.user.role,
        level: p.level,
        target: Number(p.yearlyTarget || 0),
        targetType: p.targetType,
        slabQualified: p.slabQualified,
        revenue: personalRevenue + teamRevenue,
        placementsCount: personalPlacementsCount + teamPlacementsCount,
        joinedAt: p.createdAt,
      };
    }),
    members: members.map((p) => {
      const combinedPlacements = [
        ...(p.user.placements || []),
        ...(p.user.personalPlacements || [])
      ];
      return {
        id: p.id,
        userId: p.user.id,
        name: p.user.name,
        email: p.user.email,
        role: p.user.role,
        level: p.level,
        target: Number(p.yearlyTarget || 0),
        targetType: p.targetType,
        slabQualified: p.slabQualified,
        managerName: p.manager?.name || null,
        managerId: p.managerId,
        revenue: combinedPlacements.reduce(
          (sum, e) => sum + Number(e.revenue || e.revenueUsd || 0),
          0
        ),
        placementsCount: combinedPlacements.length,
        joinedAt: p.createdAt,
      };
    }),
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

export async function updateMemberTarget(userId, target, targetType, actorId) {
  // Check actor role (security redundancy)
  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { role: true }
  });

  if (!actor || actor.role !== "S1_ADMIN") {
    const error = new Error("Only Admin can update targets");
    error.statusCode = 403;
    throw error;
  }

  const dataToUpdate = {
    yearlyTarget: target,
  };
  
  if (targetType) {
    dataToUpdate.targetType = targetType;
  }

  const profile = await prisma.employeeProfile.update({
    where: { id: userId },
    data: dataToUpdate,
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
        targetType: targetType
      },
    },
  });

  return profile;
}

export async function importTeamTargets(teamId, targets, actorId) {
  const results = {
    updated: 0,
    failed: 0,
    errors: []
  };

  // 1. Fetch all team members to match names efficiently
  const teamMembers = await prisma.user.findMany({
    where: {
      employeeProfile: {
        teamId: teamId
      }
    },
    include: {
      employeeProfile: true
    }
  });

  // Create a map of normalized name -> user
  const memberMap = new Map();
  teamMembers.forEach(m => {
    memberMap.set(m.name.trim().toLowerCase(), m);
  });

  for (const row of targets) {
    try {
      if (!row.name) continue;

      const normalizedName = row.name.trim().toLowerCase();
      const user = memberMap.get(normalizedName);

      if (!user) {
        results.failed++;
        results.errors.push(`User not found: ${row.name}`);
        continue;
      }

      // Determine target and type
      // Default type to PLACEMENTS if not specified, or respect row input
      // Default target to 10 if missing/invalid
      let targetVal = Number(row.target);
      if (isNaN(targetVal)) targetVal = 10; // Default logic per requirements

      const targetType = row.type || "PLACEMENTS";

      await prisma.employeeProfile.update({
        where: { id: user.id },
        data: {
          yearlyTarget: targetVal,
          targetType: targetType
        }
      });

      results.updated++;
    } catch (err) {
      results.failed++;
      results.errors.push(`Error updating ${row.name}: ${err.message}`);
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "BULK_TARGET_IMPORT",
      entityType: "Team",
      entityId: teamId,
      changes: {
        updatedCount: results.updated,
        failedCount: results.failed
      },
    },
  });

  return results;
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



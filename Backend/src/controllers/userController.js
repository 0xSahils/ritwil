import { Role } from "../generated/client/index.js";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";

// const prisma = new PrismaClient();

export async function listUsersWithRelations({ page = 1, pageSize = 25, actor, role }) {
  const skip = (page - 1) * pageSize;
  
  let targetRoles = [Role.TEAM_LEAD, Role.EMPLOYEE, Role.LIMITED_ACCESS];
  if (actor && actor.role === Role.S1_ADMIN) {
    targetRoles.push(Role.SUPER_ADMIN);
  }

  if (role) {
      if (targetRoles.includes(role)) {
          targetRoles = [role];
      } else {
          // If requested role is not allowed, return empty
          targetRoles = [];
      }
  }
  
  const where = { role: { in: targetRoles } };

  if (actor && actor.role === Role.SUPER_ADMIN) {
    // 1. Fetch full actor details to get teamId
    const fullActor = await prisma.user.findUnique({
      where: { id: actor.id },
      include: { employeeProfile: true }
    });

    const teamId = fullActor?.employeeProfile?.teamId;

    if (teamId) {
       // Scope to users in the same team
       where.employeeProfile = { teamId };
    } else {
       // Fallback: Restrict to hierarchy if no team found
       where.OR = [
        { managerId: actor.id },
        { manager: { managerId: actor.id } },
        { manager: { manager: { managerId: actor.id } } }
      ];
    }
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        employeeProfile: {
          include: { team: true, manager: true },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: pageSize,
    }),
  ]);

  const data = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    level: u.employeeProfile?.level || null,
    team: u.employeeProfile?.team
      ? {
          id: u.employeeProfile.team.id,
          name: u.employeeProfile.team.name,
        }
      : null,
    manager: u.employeeProfile?.manager
      ? {
          id: u.employeeProfile.manager.id,
          name: u.employeeProfile.manager.name,
        }
      : null,
    yearlyTarget: u.employeeProfile?.yearlyTarget || null,
    targetType: u.employeeProfile?.targetType || "REVENUE",
  }));

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      employeeProfile: {
        include: { team: true, manager: true },
      },
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    employeeProfile: user.employeeProfile
  };
}

export async function createUserWithProfile(payload, actorId) {
  const {
    email,
    password,
    name,
    role,
    teamId,
    managerId,
    level,
    yearlyTarget,
    targetType,
  } = payload;

  if (!email || !password || !name || !role) {
    const error = new Error("Missing required fields");
    error.statusCode = 400;
    throw error;
  }

  if (![Role.S1_ADMIN, Role.SUPER_ADMIN, Role.TEAM_LEAD, Role.LIMITED_ACCESS, Role.EMPLOYEE].includes(role)) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
        managerId: managerId || null,
        employeeProfile:
          role === Role.S1_ADMIN || role === Role.SUPER_ADMIN
            ? undefined
            : {
                create: {
                  teamId: teamId || null,
                  managerId: managerId || null,
                  level: level || null,
                  yearlyTarget: yearlyTarget || 0,
                  targetType: targetType || "REVENUE",
                },
              },
      },
      include: {
        employeeProfile: {
          include: { team: true, manager: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId,
        action: "USER_CREATED",
        entityType: "User",
        entityId: user.id,
        changes: {
          email: user.email,
          name: user.name,
          role: user.role,
          teamId: user.employeeProfile?.teamId || null,
          managerId: user.employeeProfile?.managerId || null,
          level: user.employeeProfile?.level || null,
          yearlyTarget: user.employeeProfile?.yearlyTarget || null,
    targetType: user.employeeProfile?.targetType || null,
  },
      },
    });

    return user;
  } catch (err) {
    if (err.code === "P2002") {
      const error = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

export async function updateUserWithProfile(id, body, actor) {
  const {
    email,
    name,
    role,
    password,
    teamId: rawTeamId,
    managerId: rawManagerId,
    level: rawLevel,
    vbid,
    yearlyTarget: rawYearlyTarget,
    targetType,
    isActive,
  } = body;

  const teamId = rawTeamId === "" ? null : rawTeamId;
  const managerId = rawManagerId === "" ? null : rawManagerId;
  const level = rawLevel === "" ? null : rawLevel;
  const yearlyTarget = (rawYearlyTarget === "" || rawYearlyTarget === null) ? 0 : rawYearlyTarget;

  if (actor.role !== Role.SUPER_ADMIN && actor.role !== Role.S1_ADMIN) {
    if (
      role ||
      rawTeamId !== undefined ||
      rawManagerId !== undefined ||
      rawLevel !== undefined ||
      rawYearlyTarget !== undefined ||
      targetType !== undefined ||
      typeof isActive === "boolean"
    ) {
      const error = new Error("Unauthorized to change sensitive fields");
      error.statusCode = 403;
      throw error;
    }
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { employeeProfile: true },
  });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const data = {};
  if (email) data.email = email.toLowerCase();
  if (name) data.name = name;
  if (actor.role === Role.SUPER_ADMIN && role) data.role = role;
  if (
    actor.role === Role.SUPER_ADMIN &&
    typeof isActive === "boolean"
  )
    data.isActive = isActive;
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  let employeeProfileUpdate = undefined;

  if (actor.role === Role.SUPER_ADMIN) {
    employeeProfileUpdate =
      role === Role.SUPER_ADMIN
        ? user.employeeProfile
          ? {
              update: {
                isActive:
                  typeof isActive === "boolean"
                    ? isActive
                    : user.employeeProfile.isActive,
                deletedAt:
                  isActive === false
                    ? new Date()
                    : user.employeeProfile.deletedAt,
              },
            }
          : undefined
        : {
            upsert: {
              create: {
                teamId: teamId || null,
                managerId: managerId || null,
                level: level || null,
                vbid: vbid || null,
                yearlyTarget: yearlyTarget || 0,
                targetType: targetType || "REVENUE",
                isActive:
                  typeof isActive === "boolean"
                    ? isActive
                    : user.employeeProfile?.isActive ?? true,
                deletedAt:
                  isActive === false
                    ? new Date()
                    : user.employeeProfile?.deletedAt || null,
              },
              update: {
                teamId: teamId !== undefined ? teamId : (user.employeeProfile?.teamId ?? null),
                managerId: managerId !== undefined ? managerId : (user.employeeProfile?.managerId ?? null),
                level: level !== undefined ? level : (user.employeeProfile?.level ?? null),
                vbid: vbid !== undefined ? vbid : (user.employeeProfile?.vbid ?? null),
                yearlyTarget: yearlyTarget !== undefined ? yearlyTarget : (user.employeeProfile?.yearlyTarget ?? 0),
                targetType: targetType !== undefined ? targetType : (user.employeeProfile?.targetType ?? "REVENUE"),
                isActive:
                  typeof isActive === "boolean"
                    ? isActive
                    : user.employeeProfile?.isActive ?? true,
                deletedAt:
                  isActive === false
                    ? new Date()
                    : user.employeeProfile?.deletedAt || null,
              },
            },
          };
  }

  const before = {
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    employeeProfile: user.employeeProfile,
  };

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...data,
      employeeProfile: employeeProfileUpdate,
    },
    include: {
      employeeProfile: {
        include: { team: true, manager: true },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "USER_UPDATED",
      entityType: "User",
      entityId: updated.id,
      changes: {
        before,
        after: {
          email: updated.email,
          name: updated.name,
          role: updated.role,
          isActive: updated.isActive,
          employeeProfile: updated.employeeProfile,
        },
      },
    },
  });

  return updated;
}

export async function softDeleteUser(id, actorId) {
  // Check if actor has permission (get actor details first)
  const actor = await prisma.user.findUnique({ where: { id: actorId }, include: { employeeProfile: true } });
  
  if (actor.role === Role.SUPER_ADMIN) {
      // Perform same scope check as update
      const targetUser = await prisma.user.findUnique({
          where: { id },
          include: { employeeProfile: true }
      });
      
      if (!targetUser) return null; // Or throw not found

      const actorTeamId = actor.employeeProfile?.teamId;
      let hasAccess = false;
      
      if (actorTeamId) {
          if (targetUser.employeeProfile?.teamId === actorTeamId) hasAccess = true;
      } else {
           const hierarchyCheck = await prisma.user.findFirst({
            where: {
              id,
              OR: [
                { managerId: actor.id },
                { manager: { managerId: actor.id } },
                { manager: { manager: { managerId: actor.id } } },
              ],
            },
          });
          if (hierarchyCheck) hasAccess = true;
      }
      
      if (!hasAccess) {
          const error = new Error("Forbidden: Access denied to this user");
          error.statusCode = 403;
          throw error;
      }
  }

  const profile = await prisma.employeeProfile.findUnique({
    where: { id },
  });

  if (profile) {
    await prisma.employeeProfile.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  await prisma.refreshToken.updateMany({
    where: { userId: id },
    data: { isRevoked: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "USER_DELETED",
      entityType: "User",
      entityId: id,
      changes: {
        isActive: false,
      },
    },
  });

  return user;
}


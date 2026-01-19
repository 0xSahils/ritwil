import pkg from "@prisma/client";
import bcrypt from "bcryptjs";

const { PrismaClient, Role } = pkg;
const prisma = new PrismaClient();

export async function listUsersWithRelations({ page = 1, pageSize = 25 }) {
  const skip = (page - 1) * pageSize;
  const [total, users] = await Promise.all([
    prisma.user.count({
      where: { role: { in: [Role.TEAM_LEAD, Role.EMPLOYEE] } },
    }),
    prisma.user.findMany({
      where: { role: { in: [Role.TEAM_LEAD, Role.EMPLOYEE] } },
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
  } = payload;

  if (!email || !password || !name || !role) {
    const error = new Error("Missing required fields");
    error.statusCode = 400;
    throw error;
  }

  if (![Role.SUPER_ADMIN, Role.TEAM_LEAD, Role.EMPLOYEE].includes(role)) {
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
        employeeProfile:
          role === Role.SUPER_ADMIN
            ? undefined
            : {
                create: {
                  teamId: teamId || null,
                  managerId: managerId || null,
                  level: level || null,
                  yearlyTarget: yearlyTarget || 0,
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
    teamId,
    managerId,
    level,
    yearlyTarget,
    isActive,
  } = body;

  if (actor.role !== Role.SUPER_ADMIN) {
    if (
      role ||
      teamId ||
      managerId ||
      level ||
      yearlyTarget ||
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
                yearlyTarget: yearlyTarget || 0,
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
                teamId: teamId ?? user.employeeProfile?.teamId ?? null,
                managerId:
                  managerId ?? user.employeeProfile?.managerId ?? null,
                level: level ?? user.employeeProfile?.level ?? null,
                yearlyTarget:
                  yearlyTarget ?? user.employeeProfile?.yearlyTarget ?? 0,
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


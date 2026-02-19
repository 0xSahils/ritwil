import { Role } from "../generated/client/index.js";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";

const COMMENT_MAX_LENGTH = 1000;

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
  
  const where = { 
    role: { in: targetRoles },
    isActive: true // Only return active users
  };

  if (actor && actor.role === Role.SUPER_ADMIN) {
    // 1. Fetch full actor details to get teamId
    const fullActor = await prisma.user.findUnique({
      where: { id: actor.id },
      include: { employeeProfile: true }
    });

    const teamId = fullActor?.employeeProfile?.teamId;

    if (teamId) {
       // Scope to users in the same team (exclude soft-deleted)
       where.employeeProfile = { teamId, isActive: true, deletedAt: null };
    } else {
       // Fallback: Restrict to hierarchy if no team found
       where.OR = [
        { managerId: actor.id },
        { manager: { managerId: actor.id } },
        { manager: { manager: { managerId: actor.id } } }
      ];
       where.employeeProfile = { deletedAt: null };
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
    yearlyTarget: null,
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
    targetType,
    vbid,
  } = payload;

  if (!email || !password || !name || !role) {
    const error = new Error("Missing required fields");
    error.statusCode = 400;
    throw error;
  }

  // Require vbid for ALL roles
  if (!vbid || !vbid.trim()) {
    const error = new Error("VB ID is required");
    error.statusCode = 400;
    throw error;
  }

  if (![Role.S1_ADMIN, Role.SUPER_ADMIN, Role.TEAM_LEAD, Role.LIMITED_ACCESS, Role.EMPLOYEE].includes(role)) {
    const error = new Error("Invalid role");
    error.statusCode = 400;
    throw error;
  }

  // Validate vbid uniqueness - check both User.vbid and EmployeeProfile.vbid
  const trimmedVbid = vbid.trim();
  const existingUser = await prisma.user.findFirst({
    where: { vbid: trimmedVbid },
  });
  if (existingUser) {
    const error = new Error("VB ID already in use");
    error.statusCode = 409;
    throw error;
  }
  
  const existingProfile = await prisma.employeeProfile.findUnique({
    where: { vbid: trimmedVbid },
  });
  if (existingProfile) {
    const error = new Error("VB ID already in use");
    error.statusCode = 409;
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
        vbid: trimmedVbid, // vbid stored on User for all roles (including SUPER_ADMIN and S1_ADMIN)
        employeeProfile:
          role === Role.S1_ADMIN || role === Role.SUPER_ADMIN
            ? undefined
            : {
                create: {
                  teamId: teamId || null,
                  managerId: managerId || null,
                  level: level || null,
                  targetType: targetType || "REVENUE",
                  vbid: trimmedVbid, // Canonical vbid on EmployeeProfile for non-admin roles
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
          vbid: trimmedVbid,
          teamId: user.employeeProfile?.teamId || null,
          managerId: user.employeeProfile?.managerId || null,
          level: user.employeeProfile?.level || null,
          targetType: user.employeeProfile?.targetType || null,
        },
      },
    });

    return user;
  } catch (err) {
    if (err.code === "P2002") {
      if (err.meta?.target?.includes("vbid")) {
        const error = new Error("VB ID already in use");
        error.statusCode = 409;
        throw error;
      }
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
    targetType,
    isActive,
    comment,
  } = body;

  const teamId = rawTeamId === "" ? null : rawTeamId;
  const managerId = rawManagerId === "" ? null : rawManagerId;
  const level = rawLevel === "" ? null : rawLevel;
  if (comment !== undefined && comment !== null && String(comment).length > COMMENT_MAX_LENGTH) {
    const err = new Error(`Comment must be at most ${COMMENT_MAX_LENGTH} characters`);
    err.statusCode = 400;
    throw err;
  }
  if (actor.role !== Role.SUPER_ADMIN && actor.role !== Role.S1_ADMIN) {
    if (
      role ||
      rawTeamId !== undefined ||
      rawManagerId !== undefined ||
      rawLevel !== undefined ||
      targetType !== undefined ||
      typeof isActive === "boolean" ||
      comment !== undefined
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
    // If updating own password, require old password verification
    if (actor.id === id && body.oldPassword) {
      const isOldPasswordValid = await bcrypt.compare(body.oldPassword, user.passwordHash);
      if (!isOldPasswordValid) {
        const error = new Error("Current password is incorrect");
        error.statusCode = 400;
        throw error;
      }
    } else if (actor.id === id && !body.oldPassword) {
      // User updating their own password must provide old password
      const error = new Error("Current password is required");
      error.statusCode = 400;
      throw error;
    }
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  let employeeProfileUpdate = undefined;

  if (actor.role === Role.SUPER_ADMIN && comment !== undefined) {
    const error = new Error("Only S1_ADMIN can update or create comments");
    error.statusCode = 403;
    throw error;
  }

  if (actor.role === Role.SUPER_ADMIN) {
    // Validate vbid uniqueness if being updated - check both User.vbid and EmployeeProfile.vbid
    let finalVbid = vbid !== undefined ? (vbid === "" ? null : vbid.trim()) : (user.employeeProfile?.vbid ?? user.vbid ?? null);
    
    // Require vbid if not already set on the user
    if (!finalVbid || !finalVbid.trim()) {
      // Check if user already has a vbid
      const existingVbid = user.vbid || user.employeeProfile?.vbid;
      if (!existingVbid) {
        const error = new Error("VB ID is required");
        error.statusCode = 400;
        throw error;
      }
      // Use existing vbid if not being updated
      finalVbid = existingVbid;
    } else {
      const trimmedVbid = finalVbid.trim();
      
      // Check User.vbid uniqueness
      const existingUser = await prisma.user.findFirst({
        where: {
          vbid: trimmedVbid,
          id: { not: user.id },
        },
      });
      if (existingUser) {
        const error = new Error("VB ID already in use");
        error.statusCode = 409;
        throw error;
      }
      
      // Check EmployeeProfile.vbid uniqueness
      const existingProfile = await prisma.employeeProfile.findFirst({
        where: {
          vbid: trimmedVbid,
          id: { not: user.id },
        },
      });
      if (existingProfile) {
        const error = new Error("VB ID already in use");
        error.statusCode = 409;
        throw error;
      }
      
      finalVbid = trimmedVbid;
    }

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
                vbid: finalVbid,
                targetType: targetType || "REVENUE",
                comment: user.employeeProfile?.comment ?? null,
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
                vbid: finalVbid,
                targetType: targetType !== undefined ? targetType : (user.employeeProfile?.targetType ?? "REVENUE"),
                comment: user.employeeProfile?.comment ?? null,
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
    
    // Sync vbid to User model (denormalized)
    if (vbid !== undefined) {
      data.vbid = finalVbid;
    }
  }

  if (actor.role === Role.S1_ADMIN && user.employeeProfile && comment !== undefined) {
    employeeProfileUpdate = {
      update: {
        comment: comment === "" ? null : comment,
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

/**
 * Bulk update comment on employee profiles. Only S1_ADMIN; no restriction on which users.
 */
export async function updateBulkComment(actorId, { userIds, comment }) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    const error = new Error("userIds must be a non-empty array");
    error.statusCode = 400;
    throw error;
  }

  const rawComment = comment == null ? "" : String(comment);
  const commentValue = rawComment.trim() === "" ? null : rawComment.trim();
  if (commentValue !== null && commentValue.length > COMMENT_MAX_LENGTH) {
    const error = new Error(`Comment must be at most ${COMMENT_MAX_LENGTH} characters`);
    error.statusCode = 400;
    throw error;
  }

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    include: { employeeProfile: true },
  });
  if (!actor || actor.role !== Role.S1_ADMIN) {
    const error = new Error("Forbidden: only S1_ADMIN can bulk-update comments");
    error.statusCode = 403;
    throw error;
  }

  const allowedUserIds = userIds;

  if (allowedUserIds.length === 0) {
    const error = new Error(
      "None of the selected members could be updated. You may not have permission to update their comments."
    );
    error.statusCode = 403;
    throw error;
  }

  await prisma.employeeProfile.updateMany({
    where: { id: { in: allowedUserIds } },
    data: { comment: commentValue },
  });

  return { updated: allowedUserIds.length, userIds: allowedUserIds };
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


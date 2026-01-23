import pkg from "@prisma/client";
import prisma from "../prisma.js";
// const { PrismaClient } = pkg;
// const prisma = new PrismaClient();

export async function createAuditLog({ actorId, action, module, entityType, entityId, changes }) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        module,
        entityType,
        entityId,
        changes,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw, just log error so main flow isn't interrupted
  }
}

export async function getAuditLogs({ page = 1, pageSize = 50, entityType, actorId, module, action, startDate, endDate }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  
  if (entityType) where.entityType = entityType;
  if (actorId) where.actorId = actorId;
  if (module) where.module = module;
  if (action) where.action = action;
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

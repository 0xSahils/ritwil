import prisma from "../prisma.js";
import crypto from 'crypto';

const generateHash = (previousHash, data) => {
  const content = `${previousHash || ''}${JSON.stringify(data)}`;
  return crypto.createHash('sha256').update(content).digest('hex');
};

export async function createAuditLog({ 
  actorId, 
  action, 
  module, 
  entityType, 
  entityId, 
  changes,
  status = "SUCCESS",
  ipAddress,
  userAgent,
  geoLocation
}) {
  try {
    // Get the last log to create a hash chain
    const lastLog = await prisma.auditLog.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const logData = {
        actorId,
        action,
        module,
        entityType,
        entityId,
        changes,
        status,
        ipAddress,
        userAgent,
        geoLocation
    };

    const hash = generateHash(lastLog?.hash, logData);

    await prisma.auditLog.create({
      data: {
        ...logData,
        hash
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw, just log error so main flow isn't interrupted
  }
}

export async function cleanupAuditLogs(retentionDays = 90) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - retentionDays);

  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: dateThreshold
        }
      }
    });
    console.log(`Cleaned up ${result.count} audit logs older than ${retentionDays} days.`);
    return result.count;
  } catch (error) {
    console.error("Failed to cleanup audit logs:", error);
    throw error;
  }
}

export async function getAuditLogs({ page = 1, pageSize = 50, entityType, actorId, module, action, startDate, endDate, status, ipAddress }) {
  const skip = (page - 1) * pageSize;
  const where = {};
  
  if (entityType) where.entityType = entityType;
  if (actorId) where.actorId = actorId;
  if (module) where.module = module;
  if (action) where.action = action;
  if (status) where.status = status;
  if (ipAddress) where.ipAddress = { contains: ipAddress };
  
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

export async function exportAuditLogs({ entityType, actorId, module, action, startDate, endDate, status, format = 'json' }) {
    const where = {};
    if (entityType) where.entityType = entityType;
    if (actorId) where.actorId = actorId;
    if (module) where.module = module;
    if (action) where.action = action;
    if (status) where.status = status;
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.auditLog.findMany({
        where,
        include: {
            actor: {
                select: { name: true, email: true, role: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 1000 // Limit export size for safety
    });

    const flattenedLogs = logs.map(log => ({
        timestamp: log.createdAt,
        actor: log.actor ? `${log.actor.name} (${log.actor.email})` : 'System/Unknown',
        role: log.actor?.role || 'N/A',
        action: log.action,
        module: log.module,
        entityType: log.entityType,
        entityId: log.entityId,
        status: log.status,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        geoLocation: log.geoLocation,
        changes: JSON.stringify(log.changes)
    }));

    return flattenedLogs;
}

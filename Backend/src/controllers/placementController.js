import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Helper to safely parse numbers from strings with commas/symbols
const parseCurrency = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const clean = String(val).replace(/[^0-9.-]/g, '');
  return Number(clean) || 0;
};

// Helper to normalize BillingStatus
const mapBillingStatus = (status) => {
  if (!status) return "PENDING";
  const s = String(status).toUpperCase().trim();
  if (["PENDING", "BILLED", "CANCELLED", "HOLD"].includes(s)) return s;
  
  // Map common variations
  if (s === "DONE" || s === "ACTIVE" || s === "COMPLETED") return "BILLED";
  if (s === "CANCELED") return "CANCELLED";
  if (s === "ON HOLD") return "HOLD";
  
  return "PENDING"; // Default fallback
};

// Helper to normalize PlacementType
const mapPlacementType = (type) => {
  if (!type) return "PERMANENT";
  const t = String(type).toUpperCase().trim();
  if (t === "CONTRACT" || t === "TEMPORARY") return "CONTRACT";
  return "PERMANENT";
};

function calculateDaysCompleted(doj, billingStatus) {
  if (!doj) return 0;
  // If status is CANCELLED or HOLD, maybe we shouldn't count? 
  // User didn't specify, but usually only active/billed counts.
  // For now, let's count for all except CANCELLED if implied? 
  // Let's just count from DOJ to Today.
  const start = new Date(doj);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
}

function checkQualifier(daysCompleted) {
  return daysCompleted >= 90;
}

export async function getPlacementsByUser(userId) {
  const placements = await prisma.placement.findMany({
    where: { employeeId: userId },
    orderBy: { createdAt: "desc" },
  });

  // Calculate dynamic fields on the fly
  return placements.map(p => {
    const days = calculateDaysCompleted(p.doj, p.billingStatus);
    return {
      ...p,
      daysCompleted: days, // Override DB value with fresh calculation
      qualifier: checkQualifier(days) // Override DB value
    };
  });
}

export async function createPlacement(userId, data, actorId) {
  const {
    candidateName,
    clientName,
    doi,
    doj,
    // daysCompleted, // Auto-calculated
    placementType,
    billedHours,
    marginPercent,
    revenue,
    billingStatus,
    incentivePayoutEta,
    incentiveAmountInr,
    // incentivePaid, // Manual
    // qualifier, // Auto-calculated
  } = data;

  const daysCompleted = calculateDaysCompleted(doj, billingStatus);
  const qualifier = checkQualifier(daysCompleted);
  const normalizedBillingStatus = mapBillingStatus(billingStatus);
  const normalizedPlacementType = mapPlacementType(placementType);

  const placement = await prisma.placement.create({
    data: {
      employeeId: userId,
      candidateName,
      clientName,
      doi: new Date(doi),
      doj: new Date(doj),
      daysCompleted,
      placementType: normalizedPlacementType,
      billedHours: billedHours ? Number(billedHours) : null,
      marginPercent: parseCurrency(marginPercent),
      revenue: parseCurrency(revenue),
      billingStatus: normalizedBillingStatus,
      incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
      incentiveAmountInr: parseCurrency(incentiveAmountInr),
      incentivePaid: String(data.incentivePaid).toLowerCase() === 'true',
      qualifier,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_CREATED",
      entityType: "Placement",
      entityId: placement.id,
      changes: { ...data, daysCompleted, qualifier },
    },
  });

  return placement;
}

export async function updatePlacement(id, data, actorId) {
  // Recalculate if DOJ changes
  let updates = { ...data };
  
  // Handle numeric conversions
  if (updates.revenue) updates.revenue = parseCurrency(updates.revenue);
  if (updates.marginPercent) updates.marginPercent = parseCurrency(updates.marginPercent);
  if (updates.billedHours) updates.billedHours = Number(updates.billedHours);
  if (updates.incentiveAmountInr) updates.incentiveAmountInr = parseCurrency(updates.incentiveAmountInr);
  if (updates.incentivePaid !== undefined) {
    updates.incentivePaid = String(updates.incentivePaid).toLowerCase() === 'true';
  }
  
  if (updates.billingStatus) updates.billingStatus = mapBillingStatus(updates.billingStatus);
  if (updates.placementType) updates.placementType = mapPlacementType(updates.placementType);

  // Handle dates
  if (updates.doi) updates.doi = new Date(updates.doi);
  if (updates.doj) updates.doj = new Date(updates.doj);
  if (updates.incentivePayoutEta) updates.incentivePayoutEta = new Date(updates.incentivePayoutEta);

  // Auto-calc fields if DOJ or relevant fields are present
  // We need to fetch existing if partial update? 
  // Usually PUT is full update or PATCH is partial. Let's assume we might need existing DOJ.
  // For simplicity, if DOJ is updated, we recalc. If not, we might need to fetch.
  // Let's fetch the current placement first to be safe.
  const current = await prisma.placement.findUnique({ where: { id } });
  if (!current) throw new Error("Placement not found");

  const dojToUse = updates.doj || current.doj;
  const statusToUse = updates.billingStatus || current.billingStatus;
  
  const daysCompleted = calculateDaysCompleted(dojToUse, statusToUse);
  const qualifier = checkQualifier(daysCompleted);

  updates.daysCompleted = daysCompleted;
  updates.qualifier = qualifier;

  const placement = await prisma.placement.update({
    where: { id },
    data: updates,
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_UPDATED",
      entityType: "Placement",
      entityId: id,
      changes: updates,
    },
  });

  return placement;
}

export async function bulkCreatePlacements(userId, placementsData, actorId) {
  const createdPlacements = [];
  
  for (const data of placementsData) {
    try {
      const {
        candidateName,
        clientName,
        doi,
        doj,
        placementType,
        billedHours,
        marginPercent,
        revenue,
        billingStatus,
        incentivePayoutEta,
        incentiveAmountInr,
        incentivePaid,
      } = data;

      const daysCompleted = calculateDaysCompleted(doj, billingStatus);
      const qualifier = checkQualifier(daysCompleted);
      const normalizedBillingStatus = mapBillingStatus(billingStatus);
      const normalizedPlacementType = mapPlacementType(placementType);

      const placement = await prisma.placement.create({
        data: {
          employeeId: userId,
          candidateName,
          clientName,
          doi: new Date(doi),
          doj: new Date(doj),
          daysCompleted,
          placementType: normalizedPlacementType,
          billedHours: billedHours ? Number(billedHours) : null,
          marginPercent: parseCurrency(marginPercent),
          revenue: parseCurrency(revenue),
          billingStatus: normalizedBillingStatus,
          incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
          incentiveAmountInr: parseCurrency(incentiveAmountInr),
          incentivePaid: String(incentivePaid).toLowerCase() === 'true',
          qualifier,
        },
      });
      createdPlacements.push(placement);
    } catch (err) {
      console.error("Error creating placement in bulk:", err, data);
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_BULK_CREATED",
      entityType: "User",
      entityId: userId,
      changes: { count: createdPlacements.length },
    },
  });

  return createdPlacements;
}

export async function bulkCreateGlobalPlacements(placementsData, actorId) {
  const createdPlacements = [];
  const errors = [];

  for (const data of placementsData) {
    try {
      const {
        employeeId, // Must be provided
        candidateName,
        clientName,
        doi,
        doj,
        placementType,
        billedHours,
        marginPercent,
        revenue,
        billingStatus,
        incentivePayoutEta,
        incentiveAmountInr,
        incentivePaid,
      } = data;

      if (!employeeId) {
        errors.push({ data, error: "Missing employeeId" });
        continue;
      }

      // Validate Dates
      const validDoj = doj ? new Date(doj) : new Date(); // Default to now if missing
      const validDoi = doi ? new Date(doi) : validDoj;   // Default to DOJ if missing

      if (isNaN(validDoj.getTime()) || isNaN(validDoi.getTime())) {
        errors.push({ data, error: "Invalid Date format for DOJ or DOI" });
        continue;
      }

      const daysCompleted = calculateDaysCompleted(validDoj, billingStatus);
      const qualifier = checkQualifier(daysCompleted);
      const normalizedBillingStatus = mapBillingStatus(billingStatus);
      const normalizedPlacementType = mapPlacementType(placementType);

      const placement = await prisma.placement.create({
        data: {
          employee: { connect: { id: employeeId } },
          candidateName: candidateName || "Unknown Candidate",
          clientName: clientName || "Unknown Client",
          doi: validDoi,
          doj: validDoj,
          daysCompleted,
          placementType: normalizedPlacementType,
          billedHours: billedHours ? Number(billedHours) : null,
          marginPercent: parseCurrency(marginPercent),
          revenue: parseCurrency(revenue),
          billingStatus: normalizedBillingStatus,
          incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
          incentiveAmountInr: parseCurrency(incentiveAmountInr),
          incentivePaid: String(incentivePaid).toLowerCase() === 'true',
          qualifier,
        },
      });
      createdPlacements.push(placement);
    } catch (err) {
      console.error("Error creating global placement:", err.message);
      errors.push({ data, error: err.message });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_GLOBAL_BULK_CREATED",
      entityType: "System",
      entityId: "global",
      changes: { count: createdPlacements.length, errors: errors.length },
    },
  });

  return { created: createdPlacements, errors };
}

export async function deletePlacement(id, actorId) {
  const placement = await prisma.placement.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_DELETED",
      entityType: "Placement",
      entityId: id,
      changes: { id },
    },
  });

  return placement;
}

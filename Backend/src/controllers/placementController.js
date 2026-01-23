import pkg from "@prisma/client";
import prisma from "../prisma.js";

const { PrismaClient } = pkg;
// const prisma = new PrismaClient();

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
    candidateId,
    jpcId,
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
      candidateId,
      jpcId,
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

export async function updatePlacementBilling(id, billingData, actorId) {
  // billingData should be an array of { month, hours, status }
  
  // 1. Delete existing billings for this placement (simple replacement strategy)
  // or Upsert if we want to keep history, but simple replacement is easier for "manual edit"
  
  // Let's use a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Delete existing
    await prisma.monthlyBilling.deleteMany({
      where: { placementId: id }
    });

    // Create new
    if (billingData && billingData.length > 0) {
      await prisma.monthlyBilling.createMany({
        data: billingData.map(item => ({
          placementId: id,
          month: item.month,
          hours: Number(item.hours),
          status: mapBillingStatus(item.status)
        }))
      });
    }

    const updatedPlacement = await prisma.placement.findUnique({
      where: { id },
      include: { monthlyBillings: true }
    });
    
    return updatedPlacement;
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_BILLING_UPDATED",
      entityType: "Placement",
      entityId: id,
      changes: { billingData },
    },
  });

  return result;
}

export async function bulkCreatePlacements(userId, placementsData, actorId) {
  const createdPlacements = [];
  const updatedPlacements = [];
  const unchangedPlacements = [];
  const errors = [];
  
  for (const data of placementsData) {
    try {
      const {
        candidateName,
        candidateId,
        jpcId,
        clientName,
        doi,
        doj,
        revenue,
        placementType,
        billedHours,
        marginPercent,
        billingStatus,
        incentivePayoutEta,
        incentiveAmountInr,
        incentivePaid,
      } = data;

      const daysCompleted = calculateDaysCompleted(doj, billingStatus);
      const qualifier = checkQualifier(daysCompleted);
      const normalizedBillingStatus = mapBillingStatus(billingStatus);
      const normalizedPlacementType = mapPlacementType(placementType);
      const normalizedCandidateId = candidateId || null;
      const normalizedJpcId = jpcId || null;
      const normalizedBilledHours = billedHours ? Number(billedHours) : null;
      const normalizedIncentivePaid = String(incentivePaid).toLowerCase() === 'true';

      // SMART UPLOAD: Check for duplicate
      const existingPlacement = await prisma.placement.findFirst({
        where: {
          employeeId: userId,
          candidateName: { equals: candidateName, mode: 'insensitive' },
          clientName: { equals: clientName, mode: 'insensitive' }
        }
      });

      if (existingPlacement) {
        // Check if anything changed
        const isDifferent = 
             (existingPlacement.placementType !== normalizedPlacementType) ||
             (existingPlacement.billingStatus !== normalizedBillingStatus) ||
             (Math.abs((Number(existingPlacement.revenue) || 0) - (Number(revenue) || 0)) > 0.01) ||
             (Math.abs((Number(existingPlacement.marginPercent) || 0) - (Number(marginPercent) || 0)) > 0.01) ||
             (Math.abs((Number(existingPlacement.incentiveAmountInr) || 0) - (Number(incentiveAmountInr) || 0)) > 0.01) ||
             (existingPlacement.incentivePaid !== normalizedIncentivePaid) ||
             (existingPlacement.candidateId !== normalizedCandidateId) ||
             (existingPlacement.jpcId !== normalizedJpcId) ||
             (existingPlacement.doj.getTime() !== new Date(doj).getTime()) ||
             (existingPlacement.billedHours !== normalizedBilledHours);

        if (!isDifferent) {
            // UNCHANGED
            unchangedPlacements.push(existingPlacement);
            continue;
        }

        // UPDATE existing
        const updated = await prisma.placement.update({
          where: { id: existingPlacement.id },
          data: {
            doi: doi ? new Date(doi) : new Date(doj),
            doj: new Date(doj),
            daysCompleted,
            placementType: normalizedPlacementType,
            billedHours: normalizedBilledHours,
            marginPercent: parseCurrency(marginPercent),
            revenue: parseCurrency(revenue),
            billingStatus: normalizedBillingStatus,
            incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
            incentiveAmountInr: parseCurrency(incentiveAmountInr),
            incentivePaid: normalizedIncentivePaid,
            qualifier,
          }
        });
        updatedPlacements.push(updated);
      } else {
        // CREATE new
        const placement = await prisma.placement.create({
          data: {
            employeeId: userId,
            candidateName,
            candidateId,
            jpcId,
            clientName,
            doi: doi ? new Date(doi) : new Date(doj),
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
      }
    } catch (err) {
      console.error("Error processing placement in bulk:", err, data);
      errors.push({ data, error: err.message });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_BULK_PROCESSED",
      entityType: "User",
      entityId: userId,
      changes: { created: createdPlacements.length, updated: updatedPlacements.length, unchanged: unchangedPlacements.length, errors: errors.length },
    },
  });

  return { created: createdPlacements, updated: updatedPlacements, unchanged: unchangedPlacements, errors };
}

export async function bulkCreateGlobalPlacements(placementsData, actorId, campaignId = null) {
  const createdPlacements = [];
  const updatedPlacements = [];
  const unchangedPlacements = [];
  const errors = [];

  // If campaignId is provided, pre-fetch valid employees
  let validEmployeeIds = null;
  if (campaignId) {
    const employees = await prisma.employeeProfile.findMany({
      where: {
        team: {
          campaignId: campaignId
        }
      },
      select: { id: true }
    });
    validEmployeeIds = new Set(employees.map(e => e.id));
  }

  for (const data of placementsData) {
    try {
      const {
        employeeId: providedEmployeeId,
        recruiterName,
        vbid,
        candidateName,
        clientName,
        candidateId,
        jpcId,
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

      let employeeId = providedEmployeeId;

      // Lookup or Create User if ID is missing
      if (!employeeId && recruiterName) {
        let user = await prisma.user.findFirst({
          where: {
            name: { equals: recruiterName.trim(), mode: 'insensitive' }
          }
        });

        // Try lookup by VBID
        if (!user && vbid) {
             const employeeProfile = await prisma.employeeProfile.findFirst({
                 where: { vbid: String(vbid).trim() },
                 include: { user: true }
             });
             if (employeeProfile && employeeProfile.user) {
                 user = employeeProfile.user;
             }
        }

        // Create User if not found
        if (!user) {
             const baseEmail = recruiterName.replace(/[^a-zA-Z0-9]/g, '.').toLowerCase() + '@vbeyond.com';
             let email = baseEmail;
             let counter = 1;
             // Simple collision check loop (async inside loop is fine for low volume creation)
             while (await prisma.user.findUnique({ where: { email } })) {
                 email = baseEmail.replace('@', `${counter}@`);
                 counter++;
             }

             try {
                 user = await prisma.user.create({
                     data: {
                         name: recruiterName.trim(),
                         email: email,
                         passwordHash: '$2a$10$McDSEu7JWMAtZo0ykFIRx.U1Lf/qBQl/rF92qLxvM8VCRXdgsFSea', // Default password
                         role: 'EMPLOYEE',
                         employeeProfile: {
                             create: {
                                 vbid: vbid ? String(vbid).trim() : null
                             }
                         }
                     }
                 });
             } catch (createErr) {
                 console.error(`Failed to create user ${recruiterName}:`, createErr.message);
             }
        }

        if (user) {
          employeeId = user.id;
          
          // Update VBID if missing/different
          if (vbid) {
               const profile = await prisma.employeeProfile.findUnique({ where: { id: user.id } });
               if (!profile) {
                   await prisma.employeeProfile.create({ data: { id: user.id, vbid: String(vbid).trim() } });
               } else if (!profile.vbid) {
                   await prisma.employeeProfile.update({ where: { id: user.id }, data: { vbid: String(vbid).trim() } });
               }
          }
        } else {
           errors.push({ data, error: `Recruiter not found: "${recruiterName}"` });
           continue;
        }
      }

      if (!employeeId) {
        errors.push({ data, error: "Missing employeeId or valid Recruiter Name" });
        continue;
      }

      // Campaign segregation check
      if (validEmployeeIds && !validEmployeeIds.has(employeeId)) {
         errors.push({ data, error: "Employee does not belong to the specified campaign" });
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

      // SMART UPLOAD: Check for duplicate
      const existingPlacement = await prisma.placement.findFirst({
        where: {
          employeeId: employeeId,
          candidateName: { equals: candidateName || "Unknown Candidate", mode: 'insensitive' },
          clientName: { equals: clientName || "Unknown Client", mode: 'insensitive' }
        }
      });

      if (existingPlacement) {
         // Check if anything changed
         const isDifferent = 
              (existingPlacement.placementType !== normalizedPlacementType) ||
              (existingPlacement.billingStatus !== normalizedBillingStatus) ||
              (Math.abs((Number(existingPlacement.revenue) || 0) - (Number(revenue) || 0)) > 0.01) ||
              (Math.abs((Number(existingPlacement.marginPercent) || 0) - (Number(marginPercent) || 0)) > 0.01) ||
              (Math.abs((Number(existingPlacement.incentiveAmountInr) || 0) - (Number(incentiveAmountInr) || 0)) > 0.01) ||
              (existingPlacement.incentivePaid !== (String(incentivePaid).toLowerCase() === 'true')) ||
              (existingPlacement.candidateId !== candidateId) ||
              (existingPlacement.jpcId !== jpcId) ||
              (existingPlacement.doj.getTime() !== validDoj.getTime()) ||
              (existingPlacement.billedHours !== (billedHours ? Number(billedHours) : null));

         if (!isDifferent) {
             unchangedPlacements.push(existingPlacement);
             continue;
         }

        // UPDATE existing
        const updated = await prisma.placement.update({
          where: { id: existingPlacement.id },
          data: {
            candidateId,
            jpcId,
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
          }
        });
        updatedPlacements.push(updated);
      } else {
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
      }
    } catch (err) {
      console.error("Error processing global placement:", err.message);
      errors.push({ data, error: err.message });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_GLOBAL_BULK_PROCESSED",
      entityType: "System",
      entityId: campaignId || "global",
      changes: { created: createdPlacements.length, updated: updatedPlacements.length, unchanged: unchangedPlacements.length, errors: errors.length, campaignId },
    },
  });

  return { created: createdPlacements, updated: updatedPlacements, unchanged: unchangedPlacements, errors };
}

export async function bulkDeletePlacements(placementIds, actorId) {
  if (!Array.isArray(placementIds) || placementIds.length === 0) {
    throw new Error("No placement IDs provided");
  }

  const result = await prisma.placement.deleteMany({
    where: {
      id: { in: placementIds }
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_BULK_DELETED",
      entityType: "Placement",
      entityId: "Bulk",
      changes: { count: result.count, ids: placementIds },
    },
  });

  return result;
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

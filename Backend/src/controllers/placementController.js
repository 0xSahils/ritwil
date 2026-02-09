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

export async function getPlacementsByUser(userId) {
  const placements = await prisma.placement.findMany({
    where: { employeeId: userId },
    orderBy: { createdAt: "desc" },
  });

  return placements;
}

export async function createPlacement(userId, data, actorId) {
  const {
    candidateName,
    candidateId,
    placementYear,
    clientName,
    plcId,
    doi,
    doj,
    doq,
    placementType,
    billedHours,
    revenue,
    billingStatus,
    collectionStatus,
    incentivePayoutEta,
    incentiveAmountInr,
    incentivePaidInr,
    sourcer,
    accountManager,
    teamLead,
    placementSharing,
    placementCredit,
    totalRevenue,
    revenueAsLead
  } = data;

  const normalizedBillingStatus = mapBillingStatus(billingStatus);
  const normalizedPlacementType = mapPlacementType(placementType);

  const placement = await prisma.placement.create({
    data: {
      employeeId: userId,
      candidateName,
      candidateId,
      placementYear: placementYear ? Number(placementYear) : null,
      clientName,
      plcId,
      doi: doi ? new Date(doi) : null,
      doj: new Date(doj),
      doq: doq ? new Date(doq) : null,
      placementType: normalizedPlacementType,
      billedHours: billedHours ? Number(billedHours) : null,
      revenue: parseCurrency(revenue),
      billingStatus: normalizedBillingStatus,
      collectionStatus,
      incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
      incentiveAmountInr: parseCurrency(incentiveAmountInr),
      incentivePaidInr: parseCurrency(incentivePaidInr),
      sourcer,
      accountManager,
      teamLead,
      placementSharing,
      placementCredit: placementCredit ? parseCurrency(placementCredit) : null,
      totalRevenue: totalRevenue ? parseCurrency(totalRevenue) : null,
      revenueAsLead: revenueAsLead ? parseCurrency(revenueAsLead) : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_CREATED",
      entityType: "Placement",
      entityId: placement.id,
      changes: { ...data },
    },
  });

  return placement;
}

export async function updatePlacement(id, data, actorId) {
  // Recalculate if DOJ changes
  let updates = { ...data };
  
  // Handle numeric conversions
  if (updates.revenue !== undefined) updates.revenue = parseCurrency(updates.revenue);
  if (updates.billedHours !== undefined) updates.billedHours = updates.billedHours ? Number(updates.billedHours) : null;
  if (updates.incentiveAmountInr !== undefined) updates.incentiveAmountInr = parseCurrency(updates.incentiveAmountInr);
  if (updates.incentivePaidInr !== undefined) updates.incentivePaidInr = parseCurrency(updates.incentivePaidInr);
  if (updates.placementCredit !== undefined) updates.placementCredit = updates.placementCredit ? parseCurrency(updates.placementCredit) : null;
  if (updates.totalRevenue !== undefined) updates.totalRevenue = updates.totalRevenue ? parseCurrency(updates.totalRevenue) : null;
  if (updates.revenueAsLead !== undefined) updates.revenueAsLead = updates.revenueAsLead ? parseCurrency(updates.revenueAsLead) : null;
  if (updates.placementYear !== undefined) updates.placementYear = updates.placementYear ? Number(updates.placementYear) : null;
  
  if (updates.billingStatus) updates.billingStatus = mapBillingStatus(updates.billingStatus);
  if (updates.placementType) updates.placementType = mapPlacementType(updates.placementType);

  // Handle dates
  const parseDate = (val) => (val ? new Date(val) : null);

  if (updates.doi !== undefined) updates.doi = parseDate(updates.doi);
  if (updates.doq !== undefined) updates.doq = parseDate(updates.doq);
  if (updates.incentivePayoutEta !== undefined) updates.incentivePayoutEta = parseDate(updates.incentivePayoutEta);
  
  // DOJ is mandatory, so if invalid/empty, remove from updates to retain existing
  if (updates.doj !== undefined) {
    if (updates.doj) {
      updates.doj = new Date(updates.doj);
    } else {
      delete updates.doj;
    }
  }

  // Remove fields that are not in schema or handled
  delete updates.daysCompleted;
  delete updates.qualifier;
  delete updates.marginPercent;
  delete updates.jpcId;
  delete updates.clientId;
  delete updates.incentivePaid; // Using incentivePaidInr now

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
        placementYear,
        clientName,
        plcId,
        doi,
        doj,
        doq,
        revenue,
        placementType,
        billedHours,
        billingStatus,
        collectionStatus,
        incentivePayoutEta,
        incentiveAmountInr,
        incentivePaidInr,
        sourcer,
        accountManager,
        teamLead,
        placementSharing,
        placementCredit,
        totalRevenue,
        revenueAsLead,
      } = data;

      const normalizedBillingStatus = mapBillingStatus(billingStatus);
      const normalizedPlacementType = mapPlacementType(placementType);
      const normalizedCandidateId = candidateId || '-';
      const normalizedBilledHours = billedHours ? Number(billedHours) : null;
      const normalizedIncentivePaidInr = parseCurrency(incentivePaidInr);
      const validDoj = doj ? new Date(doj) : new Date();

      // SMART UPLOAD: Check for duplicate
      const existingPlacement = await prisma.placement.findFirst({
        where: {
          employeeId: userId,
          candidateName: { equals: candidateName, mode: 'insensitive' },
          clientName: { equals: clientName, mode: 'insensitive' },
          doj: validDoj
        }
      });

      if (existingPlacement) {
        // Check if anything changed
        const isDifferent = 
             (existingPlacement.placementType !== normalizedPlacementType) ||
             (existingPlacement.billingStatus !== normalizedBillingStatus) ||
             (Math.abs((Number(existingPlacement.revenue) || 0) - (Number(revenue) || 0)) > 0.01) ||
             (Math.abs((Number(existingPlacement.incentiveAmountInr) || 0) - (Number(incentiveAmountInr) || 0)) > 0.01) ||
             (Math.abs((Number(existingPlacement.incentivePaidInr) || 0) - (Number(normalizedIncentivePaidInr) || 0)) > 0.01) ||
             (existingPlacement.candidateId !== normalizedCandidateId) ||
             (existingPlacement.doj.getTime() !== new Date(doj).getTime()) ||
             (existingPlacement.billedHours !== normalizedBilledHours) ||
             (Math.abs((Number(existingPlacement.revenueAsLead) || 0) - (Number(revenueAsLead) || 0)) > 0.01);

        if (!isDifferent) {
            // UNCHANGED
            unchangedPlacements.push(existingPlacement);
            continue;
        }

        // UPDATE existing
        const updated = await prisma.placement.update({
          where: { id: existingPlacement.id },
          data: {
            candidateId: normalizedCandidateId,
            placementYear: placementYear ? Number(placementYear) : null,
            plcId,
            doi: doi ? new Date(doi) : new Date(doj),
            doj: new Date(doj),
            doq: doq ? new Date(doq) : null,
            placementType: normalizedPlacementType,
            billedHours: normalizedBilledHours,
            revenue: parseCurrency(revenue),
            billingStatus: normalizedBillingStatus,
            collectionStatus,
            incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
            incentiveAmountInr: parseCurrency(incentiveAmountInr),
            incentivePaidInr: normalizedIncentivePaidInr,
            sourcer,
            accountManager,
            teamLead,
            placementSharing,
            placementCredit: placementCredit ? parseCurrency(placementCredit) : null,
            totalRevenue: totalRevenue ? parseCurrency(totalRevenue) : null,
            revenueAsLead: revenueAsLead ? parseCurrency(revenueAsLead) : null,
          }
        });
        updatedPlacements.push(updated);
      } else {
        // CREATE new
        const placement = await prisma.placement.create({
          data: {
            employeeId: userId,
            candidateName,
            candidateId: normalizedCandidateId,
            placementYear: placementYear ? Number(placementYear) : null,
            clientName,
            plcId,
            doi: doi ? new Date(doi) : new Date(doj),
            doj: new Date(doj),
            doq: doq ? new Date(doq) : null,
            placementType: normalizedPlacementType,
            billedHours: normalizedBilledHours,
            revenue: parseCurrency(revenue),
            billingStatus: normalizedBillingStatus,
            collectionStatus,
            incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
            incentiveAmountInr: parseCurrency(incentiveAmountInr),
            incentivePaidInr: normalizedIncentivePaidInr,
            sourcer,
            accountManager,
            teamLead,
            placementSharing,
            placementCredit: placementCredit ? parseCurrency(placementCredit) : null,
            totalRevenue: totalRevenue ? parseCurrency(totalRevenue) : null,
            revenueAsLead: revenueAsLead ? parseCurrency(revenueAsLead) : null,
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
        placementYear,
        plcId,
        doi,
        doj,
        doq,
        placementType,
        billedHours,
        revenue,
        billingStatus,
        collectionStatus,
        incentivePayoutEta,
        incentiveAmountInr,
        incentivePaidInr,
        yearlyTarget,
        targetType,
        slabQualified,
        yearlyRevenueTarget,
        yearlyPlacementTarget,
        sourcer,
        accountManager,
        teamLead,
        placementSharing,
        placementCredit,
        totalRevenue,
        revenueAsLead
      } = data;

      const sanitizeString = (val) => {
        if (val === 0 || val === '0' || !val) return null;
        return String(val).trim();
      };

      const normalizedSourcer = sanitizeString(sourcer);
      const normalizedAccountManager = sanitizeString(accountManager);
      const normalizedTeamLead = sanitizeString(teamLead);
      const normalizedPlacementSharing = sanitizeString(placementSharing);

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
                                 vbid: vbid ? String(vbid).trim() : null,
                                 yearlyTarget: 0 // Default value to satisfy schema
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
        } else {
           errors.push({ data, error: `Recruiter not found: "${recruiterName}"` });
           continue;
        }
      }

      if (!employeeId) {
        errors.push({ data, error: "Missing employeeId or valid Recruiter Name" });
        continue;
      }

      // Update Profile Information if provided (runs for both new and existing users)
      {
          const updateData = {};
          
          if (vbid) {
            updateData.vbid = String(vbid).trim();
          }

          if (yearlyTarget !== undefined && yearlyTarget !== null && yearlyTarget !== "") {
            const targetVal = Number(yearlyTarget);
            if (!isNaN(targetVal)) {
              updateData.yearlyTarget = targetVal;
            }
          }

          if (yearlyRevenueTarget !== undefined && yearlyRevenueTarget !== null && yearlyRevenueTarget !== "") {
            const rt = Number(yearlyRevenueTarget);
            if (!isNaN(rt)) updateData.yearlyRevenueTarget = rt;
          }

          if (yearlyPlacementTarget !== undefined && yearlyPlacementTarget !== null && yearlyPlacementTarget !== "") {
            const pt = Number(yearlyPlacementTarget);
            if (!isNaN(pt)) updateData.yearlyPlacementTarget = pt;
          }

          if (targetType) {
             const t = String(targetType).toUpperCase();
             if (t === "REVENUE" || t === "PLACEMENTS") {
                 updateData.targetType = t;
             }
          }

          if (slabQualified !== undefined && slabQualified !== null && slabQualified !== "") {
            updateData.slabQualified = String(slabQualified);
          }

          // Apply updates if any
          if (Object.keys(updateData).length > 0) {
            const profile = await prisma.employeeProfile.findUnique({ where: { id: employeeId } });
            
            if (!profile) {
              // Create new profile
              await prisma.employeeProfile.create({ 
                data: { 
                  id: employeeId, 
                  ...updateData,
                  yearlyTarget: updateData.yearlyTarget || 0 
                } 
              });
            } else {
              const finalUpdates = {};
              if (updateData.vbid && !profile.vbid) finalUpdates.vbid = updateData.vbid; // Only set if missing
              if (updateData.yearlyTarget !== undefined) finalUpdates.yearlyTarget = updateData.yearlyTarget; // Always update target
              if (updateData.yearlyRevenueTarget !== undefined) finalUpdates.yearlyRevenueTarget = updateData.yearlyRevenueTarget;
              if (updateData.yearlyPlacementTarget !== undefined) finalUpdates.yearlyPlacementTarget = updateData.yearlyPlacementTarget;
              if (updateData.targetType !== undefined) finalUpdates.targetType = updateData.targetType; // Always update target type
              if (updateData.slabQualified !== undefined) finalUpdates.slabQualified = updateData.slabQualified; // Always update slab

              if (Object.keys(finalUpdates).length > 0) {
                await prisma.employeeProfile.update({ 
                  where: { id: employeeId }, 
                  data: finalUpdates 
                });
              }
            }
          }
      }

      // Campaign segregation check
      if (validEmployeeIds && !validEmployeeIds.has(employeeId)) {
         errors.push({ data, error: "Employee does not belong to the specified campaign" });
         continue;
      }

      // Validate Dates
      const validDoj = doj ? new Date(doj) : new Date(); // Default to now if missing
      
      // DOQ Logic
      let validDoq = null;
      if (doq && String(doq).toLowerCase() !== 'na' && String(doq).trim() !== '') {
          const d = new Date(doq);
          if (!isNaN(d.getTime())) validDoq = d;
      }

      // DOI Logic: Handle "NA" or missing by setting to null (since schema now allows DateTime?)
      let validDoi = null;
      if (doi && String(doi).toLowerCase() !== 'na' && String(doi).trim() !== '') {
         const d = new Date(doi);
         if (!isNaN(d.getTime())) validDoi = d;
      }
      // If NA or empty or invalid, validDoi remains null.

      if (isNaN(validDoj.getTime())) {
        errors.push({ data, error: "Invalid Date format for DOJ" });
        continue;
      }

      const normalizedBillingStatus = mapBillingStatus(billingStatus);
      const normalizedPlacementType = mapPlacementType(placementType);

      // Billed Hours Logic: Handle "NA" -> null
      let normalizedBilledHours = null;
      if (billedHours !== undefined && billedHours !== null && String(billedHours).toLowerCase() !== 'na' && String(billedHours).trim() !== '') {
          const bh = Number(billedHours);
          if (!isNaN(bh)) normalizedBilledHours = bh;
      }

      const normalizedCandidateId = candidateId || '-';
      const normalizedIncentivePaidInr = parseCurrency(incentivePaidInr);

      // SMART UPLOAD: Check for duplicate
      const existingPlacement = await prisma.placement.findFirst({
        where: {
          employeeId: employeeId,
          candidateName: { equals: candidateName || "Unknown Candidate", mode: 'insensitive' },
          clientName: { equals: clientName || "Unknown Client", mode: 'insensitive' },
          doj: validDoj
        }
      });

      if (existingPlacement) {
         // Check if anything changed
         const isDifferent = 
              (existingPlacement.placementType !== normalizedPlacementType) ||
              (existingPlacement.billingStatus !== normalizedBillingStatus) ||
              (Math.abs((Number(existingPlacement.revenue) || 0) - (Number(revenue) || 0)) > 0.01) ||
              (Math.abs((Number(existingPlacement.incentiveAmountInr) || 0) - (Number(incentiveAmountInr) || 0)) > 0.01) ||
              (Math.abs((Number(existingPlacement.incentivePaidInr) || 0) - (Number(normalizedIncentivePaidInr) || 0)) > 0.01) ||
              (existingPlacement.candidateId !== normalizedCandidateId) ||
              ((existingPlacement.doi ? existingPlacement.doi.getTime() : null) !== (validDoi ? validDoi.getTime() : null)) ||
              (existingPlacement.doj.getTime() !== validDoj.getTime()) ||
              ((existingPlacement.doq ? existingPlacement.doq.getTime() : null) !== (validDoq ? validDoq.getTime() : null)) ||
              (existingPlacement.billedHours !== normalizedBilledHours) ||
              (existingPlacement.sourcer !== normalizedSourcer) ||
              (existingPlacement.accountManager !== normalizedAccountManager) ||
              (existingPlacement.teamLead !== normalizedTeamLead) ||
              (existingPlacement.placementSharing !== normalizedPlacementSharing) ||
              (Math.abs((Number(existingPlacement.placementCredit) || 0) - (Number(placementCredit) || 0)) > 0.01) ||
              (Math.abs((Number(existingPlacement.totalRevenue) || 0) - (Number(totalRevenue) || 0)) > 0.01) ||
              (Math.abs((Number(existingPlacement.revenueAsLead) || 0) - (Number(revenueAsLead) || 0)) > 0.01);

         if (!isDifferent) {
             unchangedPlacements.push(existingPlacement);
             continue;
         }

        // UPDATE existing
        const updated = await prisma.placement.update({
          where: { id: existingPlacement.id },
          data: {
            candidateId: normalizedCandidateId,
            placementYear: placementYear ? Number(placementYear) : null,
            plcId,
            doi: validDoi,
            doj: validDoj,
            doq: validDoq,
            placementType: normalizedPlacementType,
            billedHours: normalizedBilledHours,
            revenue: parseCurrency(revenue),
            billingStatus: normalizedBillingStatus,
            collectionStatus,
            incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
            incentiveAmountInr: parseCurrency(incentiveAmountInr),
            incentivePaidInr: normalizedIncentivePaidInr,
            sourcer: normalizedSourcer,
            accountManager: normalizedAccountManager,
            teamLead: normalizedTeamLead,
            placementSharing: normalizedPlacementSharing,
            placementCredit: placementCredit ? parseCurrency(placementCredit) : null,
            totalRevenue: totalRevenue ? parseCurrency(totalRevenue) : null,
            revenueAsLead: revenueAsLead ? parseCurrency(revenueAsLead) : null,
          }
        });
        updatedPlacements.push(updated);
      } else {
        const placement = await prisma.placement.create({
          data: {
            employee: { connect: { id: employeeId } },
            candidateName: candidateName || "Unknown Candidate",
            candidateId: normalizedCandidateId,
            placementYear: placementYear ? Number(placementYear) : null,
            clientName: clientName || "Unknown Client",
            plcId,
            doi: validDoi,
            doj: validDoj,
            doq: validDoq,
            placementType: normalizedPlacementType,
            billedHours: normalizedBilledHours,
            revenue: parseCurrency(revenue),
            billingStatus: normalizedBillingStatus,
            collectionStatus,
            incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
            incentiveAmountInr: parseCurrency(incentiveAmountInr),
            incentivePaidInr: normalizedIncentivePaidInr,
            sourcer: normalizedSourcer,
            accountManager: normalizedAccountManager,
            teamLead: normalizedTeamLead,
            placementSharing: normalizedPlacementSharing,
            placementCredit: placementCredit ? parseCurrency(placementCredit) : null,
            totalRevenue: totalRevenue ? parseCurrency(totalRevenue) : null,
            revenueAsLead: revenueAsLead ? parseCurrency(revenueAsLead) : null,
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

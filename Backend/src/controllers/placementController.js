import prisma from "../prisma.js";
import { Role } from "../generated/client/index.js";

// Helper to parse numbers, handling "NA", currency symbols, and empty strings
const parseNum = (val, defaultVal = null) => {
  if (val === undefined || val === null || val === '') return defaultVal;
  const strVal = String(val).trim().toLowerCase();
  if (strVal === 'na' || strVal === '-' || strVal === 'n/a') return defaultVal;
  
  if (typeof val === 'number') return val;
  const clean = String(val).replace(/[^0-9.-]/g, '');
  const num = Number(clean);
  // Only return defaultVal if the cleaned string is empty or if it's truly NaN
  // We want to allow actual 0 as a valid number
  return (isNaN(num) || (clean === '' && val !== 0)) ? defaultVal : num;
};

// Alias for parseNum to maintain compatibility with existing code
const parseCurrency = (val) => parseNum(val);

// Helper to sanitize numeric values for precision 5, scale 2 (max 999.99)
// Also handles Excel decimal heuristic (e.g. 0.85 for 85%)
const sanitizePercent = (val) => {
  const num = parseNum(val);
  if (num === null) return null;
  
  let result = num;
  // Heuristic: If value is <= 1.0 and > 0, it's likely a decimal from Excel (e.g. 0.85 for 85%)
  if (result > 0 && result <= 1.0) {
    result = result * 100;
  }
  
  // Precision 5, scale 2 means max 999.99. We'll cap at 999.99 and floor at -999.99
  return Math.min(999.99, Math.max(-999.99, result));
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

// Shared helper to normalize string headers
const normalizeHeader = (h) => {
  const normalized = String(h || "").trim().toLowerCase();
  // Handle common typo "pls id" -> "plc id"
  if (normalized === "pls id") return "plc id";
  return normalized;
};

// Helper to parse dates, handling Excel serials and specific invalid formats (1/0/1990)
const parseDateCell = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const strVal = String(val).trim().toLowerCase();
  if (strVal === 'na' || strVal === '-' || strVal === 'n/a' || strVal === '0') return null;

  let d;
  if (typeof val === "number") {
    // Excel date check: numbers like 32874 (1/1/1990)
    if (val < 32874) return null; // Before 1990

    const excelEpoch = Date.UTC(1899, 11, 30);
    const ms = excelEpoch + val * 24 * 60 * 60 * 1000;
    d = new Date(ms);
  } else {
    // Handle common invalid string dates
    if (strVal === '1/0/1990' || strVal === '0/1/1990' || strVal.includes('0/0/')) return null;
    d = new Date(val);
  }

  if (isNaN(d.getTime())) return null;
  
  // Handle specific invalid date string formats
  if (d.getFullYear() <= 1990 && d.getMonth() === 0 && (d.getDate() === 0 || d.getDate() === 1)) {
    return null;
  }

  // Normalize to start of day in UTC to ensure consistent comparison and prevent duplicacy
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// Required headers for personal and team imports
// For validation we only require core placement-level columns.
// Summary/metrics columns are optional and will be stored when present.
const PERSONAL_REQUIRED_HEADERS = [
  "recruiter name",
];

const TEAM_REQUIRED_HEADERS = [
  "lead name",
];

export function validatePersonalHeaders(headers) {
  if (!Array.isArray(headers) || headers.length === 0) {
    throw new Error("Sheet has no headers");
  }
  const normalized = headers.map(normalizeHeader);
  
  // Accept either "recruiter name" or "lead name" as the primary person column
  const hasPersonHeader = normalized.some(h => 
    ["recruiter name", "lead name", "lead", "recruiter"].includes(h)
  );
  
  if (!hasPersonHeader) {
    throw new Error(
      `Invalid Members Placement sheet. Missing header: recruiter name or lead name`
    );
  }
  const map = {};
  normalized.forEach((h, idx) => {
    map[h] = idx;
  });
  const hasLeadHeader = normalized.some(h => ["lead name", "lead"].includes(h));
  const hasSplitHeader = normalized.some(h => h === "split with");

  return { headerMap: map, hasLeadHeader, hasSplitHeader };
}

export function validateTeamHeaders(headers) {
  if (!Array.isArray(headers) || headers.length === 0) {
    throw new Error("Sheet has no headers");
  }
  const normalized = headers.map(normalizeHeader);
  
  // Accept either "recruiter name" or "lead name" as the primary person column
  const hasPersonHeader = normalized.some(h => 
    ["recruiter name", "lead name", "lead", "recruiter"].includes(h)
  );

  if (!hasPersonHeader) {
    throw new Error(
      `Invalid Team Lead Placement sheet. Missing header: lead name or recruiter name`
    );
  }
  const map = {};
  normalized.forEach((h, idx) => {
    map[h] = idx;
  });
  
  const hasLeadHeader = normalized.some(h => ["lead name", "lead"].includes(h));
  const hasSplitHeader = normalized.some(h => h === "split with");

  return { headerMap: map, hasLeadHeader, hasSplitHeader };
}

// Lookup helpers
async function findEmployeeByVbOrName(vbCode, recruiterName) {
  if (vbCode) {
    const profile = await prisma.employeeProfile.findFirst({
      where: { vbid: String(vbCode).trim() },
      include: { user: true },
    });
    if (profile) return profile;
  }
  if (recruiterName) {
    const profile = await prisma.employeeProfile.findFirst({
      where: {
        user: {
          name: { equals: recruiterName.trim(), mode: "insensitive" },
        }
      },
      include: { user: true },
    });
    if (profile) return profile;
  }
  return null;
}

async function findLeadByVbOrName(vbCode, leadName) {
  if (vbCode) {
    const profile = await prisma.employeeProfile.findFirst({
      where: { vbid: String(vbCode).trim() },
      include: { user: true },
    });
    if (profile) return profile;
  }
  if (leadName) {
    const profile = await prisma.employeeProfile.findFirst({
      where: {
        user: {
          name: { equals: leadName.trim(), mode: "insensitive" },
        }
      },
      include: { user: true },
    });
    if (profile) return profile;
  }
  return null;
}

// Check if candidate matches an existing placement for the same employee
async function findExistingPersonalPlacement(employeeId, candidateName, client, doj, level, plcId) {
  if (!candidateName && !plcId) return null;
  
  // Try to find by PLC ID first (most reliable)
  // Skip "PLC-Passthrough", "0", and empty strings for unique matching
  const normalizedPlcId = String(plcId || "").trim().toLowerCase();
  const isGenericPlcId = normalizedPlcId === "plc-passthrough" || normalizedPlcId === "0" || normalizedPlcId === "";

  if (plcId && !isGenericPlcId) {
    const byPlcId = await prisma.personalPlacement.findFirst({
      where: {
        employeeId,
        plcId: { equals: String(plcId).trim(), mode: 'insensitive' }
      }
    });
    if (byPlcId) return byPlcId;
  }

  // Fallback to candidate details (for generic PLC IDs or if PLC ID match fails)
  return await prisma.personalPlacement.findFirst({
    where: {
      employeeId,
      candidateName: { equals: String(candidateName).trim(), mode: 'insensitive' },
      client: { equals: String(client).trim(), mode: 'insensitive' },
      doj: doj,
      level: level || "L4"
    }
  });
}

async function findExistingTeamPlacement(leadId, candidateName, client, doj, level, plcId) {
  if (!candidateName && !plcId) return null;

  // Try to find by PLC ID first (most reliable)
  const normalizedPlcId = String(plcId || "").trim().toLowerCase();
  const isGenericPlcId = normalizedPlcId === "plc-passthrough" || normalizedPlcId === "0" || normalizedPlcId === "";

  if (plcId && !isGenericPlcId) {
    const byPlcId = await prisma.teamPlacement.findFirst({
      where: {
        leadId,
        plcId: { equals: String(plcId).trim(), mode: 'insensitive' }
      }
    });
    if (byPlcId) return byPlcId;
  }

  // Fallback to candidate details
  return await prisma.teamPlacement.findFirst({
    where: {
      leadId,
      candidateName: { equals: String(candidateName).trim(), mode: 'insensitive' },
      client: { equals: String(client).trim(), mode: 'insensitive' },
      doj: doj,
      level: level || "L2"
    }
  });
}

export async function getPlacementsByUser(userId) {
  // Check if user is a team lead
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Fetch old Placement model, PersonalPlacement model, and TeamPlacement (if lead)
  const fetchPromises = [
    prisma.placement.findMany({
      where: { employeeId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.personalPlacement.findMany({
      where: { employeeId: userId },
      orderBy: { createdAt: "desc" },
    }),
  ];

  // If user is a team lead, also fetch team placements
  if (user?.role === Role.TEAM_LEAD) {
    fetchPromises.push(
      prisma.teamPlacement.findMany({
        where: { leadId: userId },
        orderBy: { createdAt: "desc" },
      })
    );
  }

  const results = await Promise.all(fetchPromises);
  const oldPlacements = results[0];
  const personalPlacements = results[1];
  const teamPlacements = results[2] || [];

  // Convert PersonalPlacement to Placement-like format for compatibility
  const convertedPersonalPlacements = personalPlacements.map(pp => ({
    id: pp.id,
    employeeId: pp.employeeId,
    candidateName: pp.candidateName,
    candidateId: null,
    placementYear: pp.placementYear,
    doi: null,
    doj: pp.doj,
    doq: pp.doq,
    clientName: pp.client,
    plcId: pp.plcId,
    placementType: pp.placementType,
    billingStatus: pp.billingStatus,
    collectionStatus: pp.collectionStatus,
    billedHours: pp.totalBilledHours,
    revenue: pp.revenueUsd,
    incentiveAmountInr: pp.incentiveInr,
    incentivePaidInr: pp.incentivePaidInr,
    incentivePayoutEta: null,
    sourcer: null,
    accountManager: null,
    teamLead: pp.teamLeadName,
    placementSharing: null,
    placementCredit: null,
    totalRevenue: pp.totalRevenueGenerated,
    revenueAsLead: null,
    createdAt: pp.createdAt,
  }));

  // Convert TeamPlacement to Placement-like format
  const convertedTeamPlacements = teamPlacements.map(tp => ({
    id: tp.id,
    employeeId: tp.leadId, // Use leadId as employeeId for display
    candidateName: tp.candidateName,
    candidateId: null,
    placementYear: tp.placementYear,
    doi: null,
    doj: tp.doj,
    doq: tp.doq,
    clientName: tp.client,
    plcId: tp.plcId,
    placementType: tp.placementType,
    billingStatus: tp.billingStatus,
    collectionStatus: tp.collectionStatus,
    billedHours: tp.totalBilledHours,
    revenue: tp.revenueLeadUsd,
    incentiveAmountInr: tp.incentiveInr,
    incentivePaidInr: tp.incentivePaidInr,
    incentivePayoutEta: null,
    sourcer: null,
    accountManager: null,
    teamLead: tp.leadName,
    placementSharing: tp.splitWith,
    placementCredit: null,
    totalRevenue: tp.totalRevenueGenerated,
    revenueAsLead: tp.revenueLeadUsd,
    createdAt: tp.createdAt,
  }));

  // Combine and sort by createdAt descending
  const allPlacements = [...oldPlacements, ...convertedPersonalPlacements, ...convertedTeamPlacements].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return allPlacements;
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

      // If candidateName is missing, skip placement creation but allow profile update
      if (!candidateName) {
        continue;
      }

      // SMART UPLOAD: Check for duplicate
      const existingPlacement = await prisma.placement.findFirst({
        where: {
          employeeId: employeeId,
          candidateName: { equals: candidateName, mode: 'insensitive' },
          clientName: { equals: clientName, mode: 'insensitive' },
          doj: validDoj
        }
      });

      if (existingPlacement) {
         // ... existing update logic ...
         const normalizedPlacementType = mapPlacementType(placementType);
         const normalizedBillingStatus = mapBillingStatus(billingStatus);
         const normalizedIncentivePaidInr = parseCurrency(incentivePaidInr);

         const isDifferent = 
             (existingPlacement.placementType !== normalizedPlacementType) ||
             (existingPlacement.billingStatus !== normalizedBillingStatus) ||
             (Math.abs((Number(existingPlacement.revenue) || 0) - (Number(revenue) || 0)) > 0.01) ||
             (Math.abs((Number(existingPlacement.incentiveAmountInr) || 0) - (Number(incentiveAmountInr) || 0)) > 0.01) ||
             (Math.abs((Number(existingPlacement.incentivePaidInr) || 0) - (Number(normalizedIncentivePaidInr) || 0)) > 0.01);

        if (!isDifferent) {
            unchangedPlacements.push(existingPlacement);
            continue;
        }

        const updated = await prisma.placement.update({
          where: { id: existingPlacement.id },
          data: {
             placementType: normalizedPlacementType,
             billingStatus: normalizedBillingStatus,
             revenue: parseCurrency(revenue),
             incentiveAmountInr: parseCurrency(incentiveAmountInr),
             incentivePaidInr: normalizedIncentivePaidInr,
             collectionStatus: collectionStatus || existingPlacement.collectionStatus,
             billedHours: billedHours ? Number(billedHours) : existingPlacement.billedHours,
             plcId: plcId || existingPlacement.plcId,
             placementYear: placementYear ? Number(placementYear) : existingPlacement.placementYear,
             doq: validDoq,
             sourcer: normalizedSourcer,
             accountManager: normalizedAccountManager,
             teamLead: normalizedTeamLead,
             placementSharing: normalizedPlacementSharing,
             placementCredit: placementCredit ? parseCurrency(placementCredit) : existingPlacement.placementCredit,
             totalRevenue: totalRevenue ? parseCurrency(totalRevenue) : existingPlacement.totalRevenue,
             revenueAsLead: revenueAsLead ? parseCurrency(revenueAsLead) : existingPlacement.revenueAsLead,
          }
        });
        updatedPlacements.push(updated);

      } else {
        // Create
        const placement = await prisma.placement.create({
            data: {
                employeeId,
                candidateName,
                candidateId: candidateId || '-',
                placementYear: placementYear ? Number(placementYear) : null,
                clientName: clientName || 'Unknown',
                plcId,
                doi: doi ? new Date(doi) : validDoj,
                doj: validDoj,
                doq: validDoq,
                placementType: mapPlacementType(placementType),
                billedHours: billedHours ? Number(billedHours) : null,
                revenue: parseCurrency(revenue),
                billingStatus: mapBillingStatus(billingStatus),
                collectionStatus,
                incentivePayoutEta: incentivePayoutEta ? new Date(incentivePayoutEta) : null,
                incentiveAmountInr: parseCurrency(incentiveAmountInr),
                incentivePaidInr: parseCurrency(incentivePaidInr),
                sourcer: normalizedSourcer,
                accountManager: normalizedAccountManager,
                teamLead: normalizedTeamLead,
                placementSharing: normalizedPlacementSharing,
                placementCredit: placementCredit ? parseCurrency(placementCredit) : null,
                totalRevenue: totalRevenue ? parseCurrency(totalRevenue) : null,
                revenueAsLead: revenueAsLead ? parseCurrency(revenueAsLead) : null,
            }
        });
        createdPlacements.push(placement);
      }

    } catch (e) {
      console.error("Bulk Global Error:", e);
      errors.push({ data, error: e.message });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_BULK_GLOBAL_PROCESSED",
      entityType: "User",
      changes: { created: createdPlacements.length, updated: updatedPlacements.length, unchanged: unchangedPlacements.length, errors: errors.length },
    },
  });

  return { created: createdPlacements, updated: updatedPlacements, unchanged: unchangedPlacements, errors };
}

export async function bulkUpdateMetrics(metricsData, actorId) {
  const results = { updated: 0, errors: [] };

  // Pre-fetch caches for Team and Users to reduce DB calls in loop
  const teams = await prisma.team.findMany();
  const teamMap = new Map(teams.map(t => [t.name.trim().toLowerCase(), t.id]));

  const users = await prisma.user.findMany({ select: { id: true, name: true, vbid: true } });
  const userMapName = new Map(users.map(u => [u.name.trim().toLowerCase(), u.id]));
  // For manager lookup by VBID if provided or inferred? The sheet has "Team Lead" name.

  for (const row of metricsData) {
    try {
      const {
        vbid,
        yearlyPlacementTarget,
        placementsDone,
        targetAchievementStatus,
        totalRevenue,
        slabQualified,
        totalIncentiveAmount,
        totalIncentivePaid,
        yearlyTarget,
        teamName,
        managerName,
        recruiterName,
      } = row;

      if (!vbid) {
        results.errors.push({ row, error: "Missing VBid" });
        continue;
      }

      // Find Profile by VBID
      const profile = await prisma.employeeProfile.findFirst({
        where: { vbid: String(vbid).trim() }
      });

      if (!profile) {
        results.errors.push({ row, error: `No profile found for VBid: ${vbid}` });
        continue;
      }

      const updateData = {};
      
      // Team-based rule:
      // - For Vantage teams (team name contains "vant"): keep targets REVENUE-based
      // - For all other teams: treat yearly placement target as "number of placements"
      const teamNameStr = teamName ? String(teamName).toLowerCase() : "";
      const isVantageTeam = teamNameStr.includes("vant");

      if (isVantageTeam) {
        // Vantage: keep revenue target, targetType = REVENUE
        const revenueTarget = parseNum(yearlyTarget, undefined);
        if (revenueTarget !== undefined) {
          updateData.yearlyTarget = revenueTarget;
        }
        updateData.targetType = "REVENUE";
        // Still store placement target separately if provided (for reference),
        // but do NOT use it as the main yearlyTarget.
        const placementTargetNum = parseNum(yearlyPlacementTarget, undefined);
        if (placementTargetNum !== undefined) {
          updateData.yearlyPlacementTarget = placementTargetNum;
        }
      } else {
        // All non-Vantage teams: yearly target is "number of placements"
        const placementTargetNum = parseNum(yearlyPlacementTarget, undefined);
        if (placementTargetNum !== undefined) {
          updateData.yearlyPlacementTarget = placementTargetNum;
          // Also mirror into yearlyTarget so dashboards can use a single field
          updateData.yearlyTarget = placementTargetNum;
        }
        updateData.targetType = "PLACEMENTS";
      }

      if (placementsDone !== undefined) updateData.placementsDone = parseInt(parseNum(placementsDone, undefined) || 0);
      if (targetAchievementStatus !== undefined) updateData.targetAchievementStatus = String(targetAchievementStatus);
      if (totalRevenue !== undefined) updateData.totalRevenue = parseNum(totalRevenue, undefined);
      if (slabQualified !== undefined) updateData.slabQualified = String(slabQualified);
      if (totalIncentiveAmount !== undefined) updateData.totalIncentiveAmount = parseNum(totalIncentiveAmount, undefined);
      if (totalIncentivePaid !== undefined) updateData.totalIncentivePaid = parseNum(totalIncentivePaid, undefined);

      // Handle Team
      if (teamName) {
        const tName = String(teamName).trim().toLowerCase();
        if (teamMap.has(tName)) {
          updateData.teamId = teamMap.get(tName);
        }
      }

      // Handle Manager
      if (managerName) {
        const mName = String(managerName).trim().toLowerCase();
        // Try exact name match
        if (userMapName.has(mName)) {
          updateData.managerId = userMapName.get(mName);
        }
        // If not found, we could try fuzzy or just skip manager update
      }

      /*
      // Handle Recruiter Name (Update User name if provided)
      if (recruiterName) {
        const rName = String(recruiterName).trim();
        if (rName) {
          await prisma.user.update({
            where: { id: profile.id },
            data: { name: rName }
          });
        }
      }
      */

      if (Object.keys(updateData).length > 0) {
        await prisma.employeeProfile.update({
          where: { id: profile.id },
          data: updateData
        });
        results.updated++;
      }

    } catch (err) {
      results.errors.push({ row, error: err.message });
    }
  }
  
  await prisma.auditLog.create({
      data: {
        actorId,
        action: "METRICS_BULK_UPDATED",
        entityType: "EmployeeProfile",
        changes: { count: results.updated, errors: results.errors.length }
      }
  });

  return results;
}

// --- SHARED SUMMARY EXTRACTION HELPERS ---

// Helper to extract ALL summary fields from a row (using header mapping)
const extractSummaryFields = (row, getVal) => {
  return {
    vbCode: getVal(row, "vb code") ? String(getVal(row, "vb code")).trim() : null,
    recruiterName: getVal(row, "recruiter name") || getVal(row, "lead name") || getVal(row, "lead") || getVal(row, "recruiter") ? String(getVal(row, "recruiter name") || getVal(row, "lead name") || getVal(row, "lead") || getVal(row, "recruiter")).trim() : null,
    teamLeadName: getVal(row, "team lead") || getVal(row, "team lead name") || getVal(row, "lead name") || getVal(row, "lead") ? String(getVal(row, "team lead") || getVal(row, "team lead name") || getVal(row, "lead name") || getVal(row, "lead")).trim() : null,
    yearlyPlacementTarget: parseNum(getVal(row, "yearly placement target") || getVal(row, "target") || getVal(row, "placement target") || getVal(row, "yearly target")),
    placementDone: parseNum(getVal(row, "placement done") || getVal(row, "total placements") || getVal(row, "placements done")),
    targetAchievedPercent: sanitizePercent(getVal(row, "target achieved %") || getVal(row, "placement ach %") || getVal(row, "achieved %") || getVal(row, "ach %")),
    yearlyRevenueTarget: parseNum(getVal(row, "yearly revenue target") || getVal(row, "revenue target") || getVal(row, "rev target")),
    revenueAch: parseNum(getVal(row, "revenue ach") || getVal(row, "total revenue") || getVal(row, "rev ach")),
    revenueTargetAchievedPercent: sanitizePercent(getVal(row, "revenue target achieved %") || getVal(row, "rev ach %") || getVal(row, "revenue ach %")),
    totalRevenueGenerated: parseNum(getVal(row, "total revenue generated (usd)") || getVal(row, "total revenue") || getVal(row, "total revenue generated")),
    slabQualified: getVal(row, "slab qualified") || getVal(row, "slab") ? String(getVal(row, "slab qualified") || getVal(row, "slab")).trim() : null,
    totalIncentiveInr: parseNum(getVal(row, "total incentive in inr") || getVal(row, "total incentive") || getVal(row, "incentive") || getVal(row, "incentive amount")),
    totalIncentivePaidInr: parseNum(getVal(row, "total incentive in inr (paid)") || getVal(row, "incentive paid") || getVal(row, "total incentive paid")),
    individualSynopsis: getVal(row, "individual synopsis") || getVal(row, "synopsis") ? String(getVal(row, "individual synopsis") || getVal(row, "synopsis")).trim() : null,
  };
};

// Helper to extract summary fields from team name row format
// Format: [Team, VB Code, Recruiter/Lead Name, Team Lead, Yearly Placement Target, Placement Done, Target Achieved %, Total Revenue Generated, Slab qualified, Total Incentive in INR, Total Incentive in INR (Paid)]
const extractSummaryFromTeamNameRow = (row, isTeamImport = false) => {
  if (isTeamImport) {
    return {
      vbCode: row[1] ? String(row[1]).trim() : null,
      leadName: row[2] ? String(row[2]).trim() : null,
      yearlyPlacementTarget: parseNum(row[3]),
      placementDone: parseNum(row[4]),
      placementAchPercent: sanitizePercent(row[5]),
      yearlyRevenueTarget: parseNum(row[6]),
      revenueAch: parseNum(row[7]),
      revenueTargetAchievedPercent: sanitizePercent(row[8]),
      totalRevenueGenerated: parseNum(row[9]),
      slabQualified: row[10] ? String(row[10]).trim() : null,
      totalIncentiveInr: parseNum(row[11]),
      totalIncentivePaidInr: parseNum(row[12]) || null,
      individualSynopsis: row[13] ? String(row[13]).trim() : null,
    };
  }
  return {
    vbCode: row[1] ? String(row[1]).trim() : null,
    recruiterName: row[2] ? String(row[2]).trim() : null,
    teamLeadName: row[3] ? String(row[3]).trim() : null,
    yearlyPlacementTarget: parseNum(row[4]),
    placementDone: parseNum(row[5]),
    targetAchievedPercent: sanitizePercent(row[6]),
    totalRevenueGenerated: parseNum(row[7]),
    slabQualified: row[8] ? String(row[8]).trim() : null,
    totalIncentiveInr: parseNum(row[9]),
    totalIncentivePaidInr: parseNum(row[10]) || null,
    individualSynopsis: row[11] ? String(row[11]).trim() : null,
  };
};

// --- NEW IMPORT FLOWS: PERSONAL & TEAM PLACEMENTS ---

export async function importPersonalPlacements(payload, actorId) {
  const { headers, rows } = payload || {};

  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error("headers and rows must be arrays");
  }

  console.log(`Starting importPersonalPlacements with ${rows.length} rows`);
  const { headerMap, hasLeadHeader, hasSplitHeader } = validatePersonalHeaders(headers);
  console.log(`Headers validated. hasLeadHeader: ${hasLeadHeader}`);

  // Pre-fetch all users and profiles to avoid DB queries in loop
  console.log("Pre-fetching users and profiles...");
  const allProfiles = await prisma.employeeProfile.findMany({
    include: { user: true },
  });
  const profileByVb = new Map();
  const profileByName = new Map();
  
  for (const p of allProfiles) {
    if (p.vbid) profileByVb.set(String(p.vbid).trim().toLowerCase(), p);
    if (p.user?.name) profileByName.set(String(p.user.name).trim().toLowerCase(), p);
  }
  
  // Helper to find employee profile from pre-fetched maps
  const findEmployeeCached = (vbCode, recruiterName) => {
    if (vbCode) {
      const profile = profileByVb.get(String(vbCode).trim().toLowerCase());
      if (profile) return profile;
    }
    if (recruiterName) {
      const profile = profileByName.get(String(recruiterName).trim().toLowerCase());
      if (profile) return profile;
    }
    return null;
  };

  const getVal = (row, key) => {
    const idx = headerMap[key];
    if (idx === undefined) return null;
    return row[idx];
  };

  // Pre-fetch team names to filter out team names being used as recruiter names
  const teams = await prisma.team.findMany({ select: { name: true } });
  const teamNames = new Set(teams.map(t => t.name.trim().toLowerCase()));

  const plcIds = [];
  const preparedRows = [];
  
  // Store summary data per employee (extracted from summary rows)
  const employeeSummaryData = new Map(); // employeeId -> summary object

  let rowIndex = 0;
  let currentVbCode = null;
  let currentRecruiterName = null;
  let currentEmployee = null;
  let inPersonBlock = false;
  let currentSummaryRow = null; // Store the summary row data
  const localPlcIds = new Set(); // Track PLC IDs within the current lead block

  // Find the "Team" column index (usually first column)
  const teamColIdx = headerMap["team"] !== undefined ? headerMap["team"] : 0;

  console.log(`Processing rows into preparedRows...`);
  for (const row of rows) {
    rowIndex += 1;
    if (rowIndex % 100 === 0) console.log(`Processing row ${rowIndex}...`);

    // Dynamic Header Detection: Detect if this is a header row (Summary or Placement)
     const rowStrings = row.map(c => String(c || "").trim().toLowerCase());
     const hasCandidateHeader = rowStrings.includes("candidate name");
     const hasPlcIdHeader = rowStrings.includes("plc id");
     const hasTeamHeaderRow = rowStrings.includes("team") && rowStrings.includes("vb code");
     
     if ((hasCandidateHeader && hasPlcIdHeader) || hasTeamHeaderRow) {
       console.log(`Row ${rowIndex}: Detected new header row (${hasCandidateHeader ? 'Placement' : 'Summary'}). Updating header mapping.`);
       const newMap = {};
       rowStrings.forEach((h, idx) => {
         if (h) newMap[h] = idx;
       });
       // REPLACE the map to avoid index mismatch between summary and placement columns
       // We keep the object reference so getVal still works
       for (const key in headerMap) delete headerMap[key];
       Object.assign(headerMap, newMap);
       continue; // Skip the header row itself
     }

    // Check if this row starts a new person block (first column contains "Team" or is a team name)
  const firstCell = row[teamColIdx];
  const firstCellLower = firstCell ? String(firstCell).trim().toLowerCase() : "";
  const isTeamHeader = firstCellLower === "team";
  const isTeamNameRow = firstCellLower && teamNames.has(firstCellLower) && row.length > 4;

    // Handle summary row that starts directly with team name (no "Team" header before it)
    if (isTeamNameRow && !isTeamHeader) {
      // This is a summary row starting with team name
      const summaryData = extractSummaryFromTeamNameRow(row);
      const vbCode = summaryData.vbCode;
      const recruiterName = summaryData.recruiterName;
      
      if (vbCode || recruiterName) {
        // Try to find employee
        const employee = findEmployeeCached(vbCode, recruiterName);
        if (employee) {
          currentVbCode = vbCode;
          currentRecruiterName = recruiterName;
          currentEmployee = employee;
          currentSummaryRow = summaryData;
          employeeSummaryData.set(employee.id, summaryData);
          inPersonBlock = true;
        }
      }
      continue; // Skip the team name row itself
    }

    if (isTeamHeader) {
      // New person block detected - reset current person tracking
      inPersonBlock = true;
      currentVbCode = null;
      currentRecruiterName = null;
      currentEmployee = null;
      currentSummaryRow = null;
      localPlcIds.clear(); // Clear local PLC tracking for new block
      
      // Try to extract VB Code and Recruiter Name AND ALL SUMMARY FIELDS from the metrics row (usually next row)
      // Look ahead to find the metrics row - it might be in team name row format
      for (let lookAhead = 1; lookAhead <= 3 && (rowIndex - 1 + lookAhead) < rows.length; lookAhead++) {
        const nextRow = rows[rowIndex - 1 + lookAhead];
        if (!nextRow || !nextRow.length) break;
        
        // Check if first column is a team name (this is the summary row format)
        const nextFirstCell = String(nextRow[0] || "").trim();
        const isNextTeamNameRow = nextFirstCell && teamNames.has(nextFirstCell.toLowerCase()) && nextRow.length > 4;
        
        let metricsVbCode, metricsRecruiterName;
        
        if (isNextTeamNameRow) {
          // Extract from team name row format: [Team, VB Code, Recruiter Name, Team Lead, ...]
          metricsVbCode = nextRow[1] ? String(nextRow[1]).trim() : null;
          metricsRecruiterName = nextRow[2] ? String(nextRow[2]).trim() : null;
          currentSummaryRow = extractSummaryFromTeamNameRow(nextRow);
        } else {
          // Try normal extraction using header mapping
          metricsVbCode = getVal(nextRow, "vb code");
          metricsRecruiterName = getVal(nextRow, "recruiter name");
          
          // Skip if recruiter name is header text or team name
          const headerTexts = ["candidate name", "vb code", "recruiter name", "lead name", "lead", "placement year", "doj", "doq", "client", "plc id"];
          if (metricsRecruiterName && (headerTexts.includes(String(metricsRecruiterName).trim().toLowerCase()) || 
              teamNames.has(String(metricsRecruiterName).trim().toLowerCase()))) {
            continue; // Skip header rows or team names
          }
          
          // Check if this looks like a metrics row (has VB Code or Recruiter Name but might not have candidate yet)
          const hasCandidate = getVal(nextRow, "candidate name");
          if (!((metricsVbCode || metricsRecruiterName) && !hasCandidate)) {
            continue; // Not a metrics row
          }
          
          // EXTRACT ALL SUMMARY FIELDS FROM THIS ROW
          currentSummaryRow = extractSummaryFields(nextRow, getVal);
        }
        
        if (metricsVbCode || metricsRecruiterName) {
          currentVbCode = metricsVbCode;
          currentRecruiterName = metricsRecruiterName;
          
          // Try to find employee immediately
          currentEmployee = findEmployeeCached(metricsVbCode, metricsRecruiterName);
          if (!currentEmployee && (metricsVbCode || metricsRecruiterName)) {
            // Skip if we can't find the employee - don't fail entire import
            continue;
          }
          
          // Store summary data for this employee
          if (currentEmployee && currentSummaryRow) {
            employeeSummaryData.set(currentEmployee.id, currentSummaryRow);
          }
          
          break; // Found metrics row, stop looking
        }
      }
      continue; // Skip the "Team" header row itself
    }

    // Check if this is a summary row (has VB Code/Recruiter Name but no candidate)
    const candidateNameRaw = getVal(row, "candidate name");
    const vbCodeInRow = getVal(row, "vb code");
    const recruiterNameInRow = getVal(row, "recruiter name");
    
    // Skip if recruiter name is actually a team name (like "CSK")
    if (recruiterNameInRow && teamNames.has(String(recruiterNameInRow).trim().toLowerCase())) {
      continue; // Skip this row - it's a team name, not a recruiter name
    }
    
    const isSummaryRow = (vbCodeInRow || recruiterNameInRow) && !candidateNameRaw;

    // If this is a summary row, extract ALL summary fields
    if (isSummaryRow) {
      const summaryData = extractSummaryFields(row, getVal);
      
      // Try to identify employee from this summary row
      let emp = currentEmployee;
      if (!emp && (summaryData.vbCode || summaryData.recruiterName)) {
        emp = findEmployeeCached(summaryData.vbCode, summaryData.recruiterName);
        if (emp) {
          currentEmployee = emp;
          currentVbCode = summaryData.vbCode;
          currentRecruiterName = summaryData.recruiterName;
          currentSummaryRow = summaryData;
          employeeSummaryData.set(emp.id, summaryData);
          inPersonBlock = true;
          localPlcIds.clear(); // Clear local PLC tracking for new person
        }
      } else if (emp) {
        // Clear local PLC tracking if we were already in a block but found a new summary row for same/new person
        if (currentSummaryRow) {
          // Merge summary data (prefer non-null values from current row)
          const merged = { ...currentSummaryRow };
          Object.keys(summaryData).forEach(key => {
            if (summaryData[key] !== null && summaryData[key] !== undefined) {
              merged[key] = summaryData[key];
            }
          });
          currentSummaryRow = merged;
          employeeSummaryData.set(emp.id, merged);
        } else {
          currentSummaryRow = summaryData;
          employeeSummaryData.set(emp.id, summaryData);
        }
      }
      
      // Continue to next row - summary rows don't create placement records
      continue;
    }

    // If we're in a person block but haven't found the employee yet, try to extract from current row
    if (inPersonBlock && !currentEmployee) {
      const vbCode = vbCodeInRow;
      const recruiterName = recruiterNameInRow;
      
      // Skip if recruiter name is header text or team name
      const headerTexts = ["candidate name", "vb code", "recruiter name", "lead name", "lead", "placement year", "doj", "doq", "client", "plc id"];
      if (recruiterName && (headerTexts.includes(String(recruiterName).trim().toLowerCase()) || 
          teamNames.has(String(recruiterName).trim().toLowerCase()))) {
        continue; // Skip header rows or team names
      }
      
      // Only update if we find actual values (not empty/null)
      if (vbCode || recruiterName) {
        if (vbCode) currentVbCode = vbCode;
        if (recruiterName) currentRecruiterName = recruiterName;
        
        if (currentVbCode || currentRecruiterName) {
          currentEmployee = findEmployeeCached(currentVbCode, currentRecruiterName);
          if (!currentEmployee) {
            // Skip if we can't find the employee - don't fail entire import
            continue;
          }
        }
      }
    }

    // Skip header rows - check if candidate name or recruiter name matches header text
    if (!candidateNameRaw) {
      continue;
    }
    const candidateNameNorm = String(candidateNameRaw).trim().toLowerCase();
    const recruiterNameNorm = recruiterNameInRow ? String(recruiterNameInRow).trim().toLowerCase() : "";
    const vbCodeNorm = vbCodeInRow ? String(vbCodeInRow).trim().toLowerCase() : "";
    
    // Skip if this is a header row (matches common header text)
    // Also check if multiple columns contain header-like text (indicates it's a header row)
    const headerTexts = ["candidate name", "vb code", "recruiter name", "lead name", "lead", "placement year", "doj", "doq", "client", "plc id", "placement type", "billing status"];
    const isHeaderRow = headerTexts.includes(candidateNameNorm) || headerTexts.includes(recruiterNameNorm) || headerTexts.includes(vbCodeNorm);
    
    // Additional check: if candidate name is a header AND recruiter name is also a header, definitely skip
    if (isHeaderRow || (headerTexts.includes(candidateNameNorm) && headerTexts.includes(recruiterNameNorm))) {
      continue; // header rows inside the block
    }

    // Use current employee from block, or try to find from row
    let employee = currentEmployee;
    if (!employee) {
      const vbCode = getVal(row, "vb code");
      const recruiterName = getVal(row, "recruiter name");
      
      // Skip if recruiter name is actually a team name or header text
      if (recruiterName) {
        const recruiterNorm = String(recruiterName).trim().toLowerCase();
        if (teamNames.has(recruiterNorm) || headerTexts.includes(recruiterNorm)) {
          continue; // Skip this row - it's a team name or header, not a recruiter name
        }
      }
      
      employee = await findEmployeeByVbOrName(vbCode, recruiterName);
      if (!employee) {
        // Skip rows where we can't find the employee instead of failing entire import
        continue;
      }
      // Update current tracking and mark as in person block
      inPersonBlock = true;
      currentVbCode = vbCode;
      currentRecruiterName = recruiterName;
      currentEmployee = employee;
    }

    const plcIdRaw = getVal(row, "plc id") || getVal(row, "pls id");
    const plcId = String(plcIdRaw || "").trim();
    if (!plcId) {
      throw new Error(`Row ${rowIndex}: missing PLC ID`);
    }
    
    // Check for duplicates within the current person's block to prevent local duplicates
    if (inPersonBlock && currentEmployee) {
      const normalizedPlcId = plcId.toLowerCase();
      if (!shouldSkipDuplicateCheck(plcId)) {
        if (localPlcIds.has(normalizedPlcId)) {
          console.log(`Skipping duplicate PLC ID ${plcId} for ${currentEmployee.user.firstName} in same sheet block`);
          continue; // Skip this row as it's a duplicate in the same sheet for the same person
        }
        localPlcIds.add(normalizedPlcId);
      }
    }
    
    plcIds.push(plcId);

    const placementYear = parseNum(getVal(row, "placement year"));

    const doj = parseDateCell(getVal(row, "doj"));
    if (!doj) {
      // Skip rows with invalid DOJ instead of failing entire import
      continue;
    }

    // Candidate Deduplication: Find existing placement (Employee, Candidate, Client, DOJ, PLC ID)
    const client = String(getVal(row, "client") || "").trim();
    const candidateName = String(getVal(row, "candidate name") || "").trim();
    const existingPlacement = await findExistingPersonalPlacement(employee.id, candidateName, client, doj, employee.level, plcId);
    
    if (existingPlacement) {
      console.log(`Row ${rowIndex}: Found existing personal placement for candidate ${candidateName} (ID: ${existingPlacement.id}). Will update.`);
    }

    const doq = parseDateCell(getVal(row, "doq"));

    const totalBilledHours = parseNum(getVal(row, "total billed hours"));

    const revenueUsd = parseCurrency(getVal(row, "revenue (usd)"));
    const incentiveInr = parseCurrency(getVal(row, "incentive amount (inr)"));
    const incentivePaidInr = parseCurrency(getVal(row, "incentive paid (inr)"));

    const yearlyPlacementTarget = parseCurrency(
      getVal(row, "yearly placement target")
    );
    const placementDone = parseNum(getVal(row, "placement done"));

    const targetAchievedPercent = sanitizePercent(getVal(row, "target achieved %"));

    const totalRevenueGenerated = parseCurrency(
      getVal(row, "total revenue generated (usd)")
    );

    const totalIncentiveInr = parseCurrency(
      getVal(row, "total incentive in inr")
    );
    const totalIncentivePaidInr = parseCurrency(
      getVal(row, "total incentive in inr (paid)")
    );

    // Get summary data for this employee (from summary row or current block)
    const summaryData = employeeSummaryData.get(employee.id) || currentSummaryRow || {};

    // Merge fields: BOTH are equally important - prefer placement row values if they exist, use summary as fallback
    // This ensures we preserve data from both sources without overwriting placement-specific data
    const finalYearlyPlacementTarget = (yearlyPlacementTarget !== null && yearlyPlacementTarget !== undefined)
      ? yearlyPlacementTarget
      : (summaryData.yearlyPlacementTarget !== null && summaryData.yearlyPlacementTarget !== undefined
          ? summaryData.yearlyPlacementTarget
          : null);
    
    const finalPlacementDone = (placementDone !== null && placementDone !== undefined)
      ? placementDone
      : (summaryData.placementDone !== null && summaryData.placementDone !== undefined
          ? summaryData.placementDone
          : null);
    
    const finalTargetAchievedPercent = (targetAchievedPercent !== null && targetAchievedPercent !== undefined)
      ? targetAchievedPercent
      : (summaryData.targetAchievedPercent !== null && summaryData.targetAchievedPercent !== undefined
          ? summaryData.targetAchievedPercent
          : null);
    
    const finalTotalRevenueGenerated = (totalRevenueGenerated !== null && totalRevenueGenerated !== undefined)
      ? totalRevenueGenerated
      : (summaryData.totalRevenueGenerated !== null && summaryData.totalRevenueGenerated !== undefined
          ? summaryData.totalRevenueGenerated
          : null);
    
    const slabFromRow = getVal(row, "slab qualified");
    const finalSlabQualified = (slabFromRow !== null && slabFromRow !== undefined && String(slabFromRow).trim() !== "")
      ? String(slabFromRow).trim()
      : (summaryData.slabQualified !== null && summaryData.slabQualified !== undefined
          ? String(summaryData.slabQualified).trim()
          : null);
    
    const finalTotalIncentiveInr = (totalIncentiveInr !== null && totalIncentiveInr !== undefined)
      ? totalIncentiveInr
      : (summaryData.totalIncentiveInr !== null && summaryData.totalIncentiveInr !== undefined
          ? summaryData.totalIncentiveInr
          : null);
    
    const finalTotalIncentivePaidInr = (totalIncentivePaidInr !== null && totalIncentivePaidInr !== undefined)
      ? totalIncentivePaidInr
      : (summaryData.totalIncentivePaidInr !== null && summaryData.totalIncentivePaidInr !== undefined
          ? summaryData.totalIncentivePaidInr
          : null);

    preparedRows.push({
      id: existingPlacement ? existingPlacement.id : undefined,
      employeeId: employee.id,
      level: employee.level || "L4", // Extract level from profile for data separation
      candidateName: String(candidateNameRaw || "").trim(),
      placementYear,
      doj,
      doq,
      client: String(getVal(row, "client") || "").trim(),
      plcId,
      placementType: String(getVal(row, "placement type") || "").trim(), // Store exact value from sheet
      billingStatus: String(getVal(row, "billing status") || "").trim(),
      collectionStatus: getVal(row, "collection status")
        ? String(getVal(row, "collection status")).trim()
        : null,
      totalBilledHours,
      revenueUsd,
      incentiveInr,
      incentivePaidInr,
      vbCode: summaryData.vbCode || (currentVbCode ? String(currentVbCode).trim() : null),
      recruiterName: summaryData.recruiterName || (currentRecruiterName ? String(currentRecruiterName).trim() : null),
      teamLeadName: (hasLeadHeader && (summaryData.teamLeadName || getVal(row, "team lead")))
        ? String(summaryData.teamLeadName || getVal(row, "team lead")).trim()
        : null,
      yearlyPlacementTarget: finalYearlyPlacementTarget,
      placementDone: finalPlacementDone,
      targetAchievedPercent: finalTargetAchievedPercent,
      totalRevenueGenerated: finalTotalRevenueGenerated,
      slabQualified: finalSlabQualified,
      totalIncentiveInr: finalTotalIncentiveInr,
      totalIncentivePaidInr: finalTotalIncentivePaidInr,
    });
  }

  if (preparedRows.length === 0 && employeeSummaryData.size === 0) {
    console.log("No valid placements or summary data found in sheet.");
    return {
      summary: {
        placementsCreated: 0,
        placementsUpdated: 0,
        employeesUpdated: 0,
      },
      batchId: null,
      errors: [],
    };
  }

  // Ensure every employee found in summary rows but without placements is added to employeeUpdates
  const employeeUpdates = new Map();
  for (const [employeeId, summaryData] of employeeSummaryData) {
    employeeUpdates.set(employeeId, {
      employeeId,
      yearlyPlacementTarget: summaryData.yearlyPlacementTarget,
      placementDone: summaryData.placementDone,
      targetAchievedPercent: summaryData.targetAchievedPercent,
      totalRevenue: summaryData.totalRevenueGenerated,
      slabQualified: summaryData.slabQualified,
      totalIncentiveAmount: summaryData.totalIncentiveInr,
      totalIncentivePaid: summaryData.totalIncentivePaidInr,
    });
  }

  // Helper to check if PLC ID should skip duplicate validation
  const shouldSkipDuplicateCheck = (plcId) => {
    const normalized = String(plcId || "").trim().toLowerCase();
    return normalized === "plc-passthrough" || normalized === "0" || normalized === "";
  };

  // Duplicate PLC IDs within payload - allow them but use the last occurrence (skip "PLC-Passthrough" and "0")
  // PLC ID is ALWAYS unique globally - so we deduplicate by plcId only
  const seenPlcIds = new Map(); // plcId -> rowIndex
  const duplicatePlcIds = new Set();
  for (let i = 0; i < preparedRows.length; i++) {
    const row = preparedRows[i];
    const plcId = row.plcId;
    if (shouldSkipDuplicateCheck(plcId)) continue;
    
    const normalizedPlcId = String(plcId).trim().toLowerCase();
    
    if (seenPlcIds.has(normalizedPlcId)) {
      duplicatePlcIds.add(plcId);
      const earlierIndex = seenPlcIds.get(normalizedPlcId);
      // Remove the earlier occurrence
      preparedRows.splice(earlierIndex, 1);
      i--; // Adjust current index after removal
      
      // Update indices of all subsequent seen items in the map
      for (const [key, idx] of seenPlcIds.entries()) {
        if (idx > earlierIndex) {
          seenPlcIds.set(key, idx - 1);
        }
      }
    }
    seenPlcIds.set(normalizedPlcId, i);
  }
  // Log warning but don't fail - duplicates will be handled by update logic
  if (duplicatePlcIds.size > 0) {
    console.warn(`Warning: Duplicate PLC ID(s) in sheet (using last occurrence): ${Array.from(duplicatePlcIds).join(", ")}`);
  }

  console.log(`Prepared ${preparedRows.length} rows. Starting transaction...`);
  // Increase transaction timeout to 60 seconds for large imports
  const result = await prisma.$transaction(async (tx) => {
    // Check duplicates in DB (skip "PLC-Passthrough" and "0")
    const rowsToInsert = [];
    const rowsToUpdate = [];

    // Separate rows into insert and update based on whether an ID was found
    for (const row of preparedRows) {
      if (row.id) {
        // Remove the id from the row data before updating to avoid primary key conflicts
        const { id, ...data } = row;
        rowsToUpdate.push({ id, data });
      } else {
        // New placement, check if it has required placement data
        if (row.candidateName && row.doj && row.client) {
          const { id, ...data } = row; // id is undefined anyway
          rowsToInsert.push(data);
        }
      }
    }

    const batch = await tx.placementImportBatch.create({
      data: {
        type: "PERSONAL",
        uploaderId: actorId,
      },
    });

    // Update existing records
    let updatedCount = 0;
    for (const item of rowsToUpdate) {
      await tx.personalPlacement.update({
        where: { id: item.id },
        data: {
          ...item.data,
          batchId: batch.id,
        },
      });
      updatedCount++;
    }

    // Insert new records
    let insertedCount = 0;
    if (rowsToInsert.length > 0) {
      await tx.personalPlacement.createMany({
        data: rowsToInsert.map((r) => ({
          ...r,
          batchId: batch.id,
        })),
      });
      insertedCount = rowsToInsert.length;
    }

    // Update EmployeeProfile targetType and yearlyTarget based on team
    // Group by employeeId and collect ALL summary data (from summary rows and placement rows)
    // Summary rows already processed into employeeUpdates above.
    // Now merge in data from placement rows if summary row data was missing for those specific fields.
    for (const row of preparedRows) {
      if (!employeeUpdates.has(row.employeeId)) {
        employeeUpdates.set(row.employeeId, {
          employeeId: row.employeeId,
          yearlyPlacementTarget: null,
          placementDone: null,
          targetAchievedPercent: null,
          totalRevenue: null,
          slabQualified: null,
          totalIncentiveAmount: null,
          totalIncentivePaid: null,
        });
      }
      const update = employeeUpdates.get(row.employeeId);
      // Only use placement row data if it exists and summary data didn't already provide it
      if (update.yearlyPlacementTarget === null && row.yearlyPlacementTarget !== null && row.yearlyPlacementTarget !== undefined) {
        update.yearlyPlacementTarget = row.yearlyPlacementTarget;
      }
      if (update.placementDone === null && row.placementDone !== null && row.placementDone !== undefined) {
        update.placementDone = row.placementDone;
      }
      if (update.targetAchievedPercent === null && row.targetAchievedPercent !== null && row.targetAchievedPercent !== undefined) {
        update.targetAchievedPercent = row.targetAchievedPercent;
      }
      if (update.totalRevenue === null && row.totalRevenueGenerated !== null && row.totalRevenueGenerated !== undefined) {
        update.totalRevenue = row.totalRevenueGenerated;
      }
      if (update.slabQualified === null && row.slabQualified !== null && row.slabQualified !== undefined) {
        update.slabQualified = row.slabQualified;
      }
      if (update.totalIncentiveAmount === null && row.totalIncentiveInr !== null && row.totalIncentiveInr !== undefined) {
        update.totalIncentiveAmount = row.totalIncentiveInr;
      }
      if (update.totalIncentivePaid === null && row.totalIncentivePaidInr !== null && row.totalIncentivePaidInr !== undefined) {
        update.totalIncentivePaid = row.totalIncentivePaidInr;
      }
    }

    // Fetch teams to identify Vantage teams
    const teams = await tx.team.findMany({ select: { id: true, name: true } });
    const vantageTeamIds = new Set(
      teams.filter(t => t.name.toLowerCase().includes('vant')).map(t => t.id)
    );

      // Update each employee's profile
      console.log(`Updating ${employeeUpdates.size} employee profiles...`);
      let updateCounter = 0;
      for (const [employeeId, data] of employeeUpdates) {
        updateCounter++;
        console.log(`Updating profile ${updateCounter}/${employeeUpdates.size}: ${employeeId}`);
        const profile = await tx.employeeProfile.findUnique({
          where: { id: employeeId },
          include: { team: { select: { id: true, name: true } } },
        });

        if (!profile) continue;

        const updateData = {};

        // Yearly target handling
        if (data.yearlyPlacementTarget !== null) {
          updateData.yearlyTarget = data.yearlyPlacementTarget;
          updateData.yearlyPlacementTarget = data.yearlyPlacementTarget;
          
          // If the recruiter belongs to a Vantage team, their "Placement Target" header 
          // actually represents a revenue value (as per user confirmation).
          const isVantage = profile.team?.name?.toLowerCase().includes('vantage');
          updateData.targetType = isVantage ? 'REVENUE' : 'PLACEMENTS';
        }

        // Update all summary fields from summary data
        if (data.placementDone !== null) {
          updateData.placementsDone = data.placementDone;
        }
        if (data.targetAchievedPercent !== null) {
          updateData.revenueTargetAchievedPercent = data.targetAchievedPercent;
        }
        if (data.totalRevenue !== null) {
          updateData.totalRevenue = data.totalRevenue;
        }
        if (data.slabQualified !== null) {
          updateData.slabQualified = data.slabQualified;
        }
        if (data.totalIncentiveAmount !== null) {
          updateData.totalIncentiveAmount = data.totalIncentiveAmount;
        }
        if (data.totalIncentivePaid !== null) {
          updateData.totalIncentivePaid = data.totalIncentivePaid;
        }

        if (Object.keys(updateData).length > 0) {
          await tx.employeeProfile.update({
            where: { id: employeeId },
            data: updateData,
          });
        }
      }

    await tx.auditLog.create({
      data: {
        actorId,
        action: "PERSONAL_PLACEMENTS_IMPORTED",
        entityType: "PlacementImportBatch",
        entityId: batch.id,
        changes: {
          inserted: insertedCount,
          updated: updatedCount,
          total: preparedRows.length,
        },
      },
    });

    return {
      summary: {
        placementsCreated: insertedCount,
        placementsUpdated: updatedCount,
        employeesUpdated: employeeUpdates.size,
      },
      batchId: batch.id,
    };
  }, {
    timeout: 60000, // 60 seconds timeout for large imports
  });

  console.log(`Transaction finished for importPersonalPlacements. Result: ${JSON.stringify(result)}`);
  return { ...result, errors: [] };
}

export async function importTeamPlacements(payload, actorId) {
  const { headers, rows } = payload || {};

  console.log(`Starting importTeamPlacements with ${rows?.length} rows`);

  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error("headers and rows must be arrays");
  }

  const { headerMap, hasLeadHeader, hasSplitHeader } = validateTeamHeaders(headers);
  console.log(`Headers validated. hasLeadHeader: ${hasLeadHeader}`);

  // Pre-fetching users and profiles for caching
  console.log("Pre-fetching users and profiles for team import...");
  const allProfiles = await prisma.employeeProfile.findMany({
    include: { user: true }
  });
  
  const profileByVb = new Map();
  const profileByName = new Map();
  
  for (const p of allProfiles) {
    if (p.vbid) {
      profileByVb.set(String(p.vbid).trim().toLowerCase(), p);
    }
    if (p.user?.name) {
      profileByName.set(String(p.user.name).trim().toLowerCase(), p);
    }
  }

  const findLeadCached = (vbCode, leadName) => {
    if (vbCode) {
      const profile = profileByVb.get(String(vbCode).trim().toLowerCase());
      if (profile) return profile;
    }
    if (leadName) {
      const profile = profileByName.get(String(leadName).trim().toLowerCase());
      if (profile) return profile;
    }
    return null;
  };

  const getVal = (row, key) => {
    const idx = headerMap[key];
    if (idx === undefined) return null;
    return row[idx];
  };

  // Pre-fetch team names to filter out team names being used as lead names
  const teams = await prisma.team.findMany({ select: { name: true } });
  const teamNames = new Set(teams.map(t => t.name.trim().toLowerCase()));

  const plcIds = [];
  const preparedRows = [];
  
  // Store summary data per lead (extracted from summary rows)
  const leadSummaryData = new Map(); // leadId -> summary object

  let rowIndex = 0;
  let currentVbCode = null;
  let currentLeadName = null;
  let currentLeadUser = null;
  let inPersonBlock = false;
  let currentSummaryRow = null; // Store the summary row data
  const localPlcIds = new Set(); // Track PLC IDs within the current lead block

  // Find the "Team" column index (usually first column)
  const teamColIdx = headerMap["team"] !== undefined ? headerMap["team"] : 0;

  console.log("Processing rows into preparedRows for team import...");

  for (const row of rows) {
    rowIndex += 1;
    if (rowIndex % 50 === 0) console.log(`Processing row ${rowIndex}/${rows.length}...`);

    // Dynamic Header Detection: If row contains "Candidate Name" and "PLC ID", it's a new header row
    const rowStrings = row.map(c => String(c || "").trim().toLowerCase());
    const hasCandidateHeader = rowStrings.includes("candidate name");
    const hasPlcIdHeader = rowStrings.includes("plc id");
    
    if (hasCandidateHeader && hasPlcIdHeader) {
      console.log(`Row ${rowIndex}: Detected new header row in team import. Updating header mapping.`);
      const newMap = {};
      rowStrings.forEach((h, idx) => {
        if (h) newMap[h] = idx;
      });
      // Merge with existing map
      Object.assign(headerMap, newMap);
      continue; // Skip the header row itself
    }

    // Check if this row starts a new person block (first column contains "Team" or is a team name)
    const firstCell = row[teamColIdx];
    const firstCellLower = firstCell ? String(firstCell).trim().toLowerCase() : "";
    const isTeamHeader = firstCellLower === "team";
    const isTeamNameRow = firstCellLower && teamNames.has(firstCellLower) && row.length > 2;

    // Handle summary row that starts directly with team name (no "Team" header before it)
    if (isTeamNameRow && !isTeamHeader) {
      // This is a summary row starting with team name
      const summaryData = extractSummaryFromTeamNameRow(row, true);
      const vbCode = summaryData.vbCode;
      const leadName = row[2] ? String(row[2]).trim() : null;
      
      if (vbCode || leadName) {
        // Try to find lead
        const leadUser = findLeadCached(vbCode, leadName);
        if (leadUser) {
          currentVbCode = vbCode;
          currentLeadName = leadName;
          currentLeadUser = leadUser;
          currentSummaryRow = summaryData;
          leadSummaryData.set(leadUser.id, summaryData);
          inPersonBlock = true;
          localPlcIds.clear(); // Clear local PLC tracking for new lead
        }
      }
      continue; // Skip the team name row itself
    }

    if (isTeamHeader) {
      // New person block detected - reset current person tracking
      inPersonBlock = true;
      currentVbCode = null;
      currentLeadName = null;
      currentLeadUser = null;
      currentSummaryRow = null;
      localPlcIds.clear(); // Clear local PLC tracking for new block
      
      // Try to extract VB Code and Lead Name AND ALL SUMMARY FIELDS from the metrics row (usually next row)
      // Look ahead to find the metrics row - it might start with team name in first column
      for (let lookAhead = 1; lookAhead <= 3 && (rowIndex - 1 + lookAhead) < rows.length; lookAhead++) {
        const nextRow = rows[rowIndex - 1 + lookAhead];
        if (!nextRow || !nextRow.length) break;
        
        // Check if first column is a team name (this is the summary row format)
        const nextFirstCell = String(nextRow[0] || "").trim();
        const isNextTeamNameRow = nextFirstCell && teamNames.has(nextFirstCell.toLowerCase());
        
        // Get values - summary row might have team name in first column, then VB Code, then Lead Name
        let metricsVbCode = getVal(nextRow, "vb code");
        let metricsLeadName = getVal(nextRow, "lead name") || getVal(nextRow, "lead");
        
        // If first column is team name, VB Code and Lead Name might be in columns 1 and 2
        if (isNextTeamNameRow && nextRow.length > 2) {
          // Extract from team name row format
          const summaryData = extractSummaryFromTeamNameRow(nextRow, true);
          metricsVbCode = summaryData.vbCode;
          metricsLeadName = nextRow[2] ? String(nextRow[2]).trim() : null;
          currentSummaryRow = summaryData;
        } else {
          // Try normal extraction
          currentSummaryRow = extractSummaryFields(nextRow, getVal);
        }
        
        // Skip if lead name is actually a team name (but allow if it's in the team name row format)
        if (metricsLeadName && !isNextTeamNameRow && teamNames.has(String(metricsLeadName).trim().toLowerCase())) {
          continue; // Skip this row - it's a team name, not a lead name
        }
        
        // Check if this looks like a metrics row (has VB Code or Lead Name but might not have candidate yet)
        const hasCandidate = getVal(nextRow, "candidate name");
        if ((metricsVbCode || metricsLeadName) && !hasCandidate) {
          currentVbCode = metricsVbCode;
          currentLeadName = metricsLeadName;
          
          // Try to find lead immediately
          currentLeadUser = findLeadCached(metricsVbCode, metricsLeadName);
          if (!currentLeadUser && (metricsVbCode || metricsLeadName)) {
            // Skip if we can't find the lead - don't fail entire import
            continue;
          }
          
          // Store summary data for this lead
          if (currentLeadUser && currentSummaryRow) {
            leadSummaryData.set(currentLeadUser.id, currentSummaryRow);
          }
          
          break; // Found metrics row, stop looking
        }
      }
      continue; // Skip the "Team" header row itself
    }

    // Check if this is a summary row (has VB Code/Lead Name but no candidate)
    const candidateNameRaw = getVal(row, "candidate name");
    const vbCodeInRow = getVal(row, "vb code");
    const leadNameInRow = getVal(row, "lead name") || getVal(row, "lead");
    
    // Skip if lead name is actually a team name
    if (leadNameInRow && teamNames.has(String(leadNameInRow).trim().toLowerCase())) {
      continue; // Skip this row - it's a team name, not a lead name
    }
    
    const isSummaryRow = (vbCodeInRow || leadNameInRow) && !candidateNameRaw;

    // If this is a summary row, extract ALL summary fields
    if (isSummaryRow) {
      const summaryData = extractSummaryFields(row, getVal);
      
      // Try to identify lead from this summary row
      let lead = currentLeadUser;
      if (!lead && (summaryData.vbCode || leadNameInRow)) {
        lead = findLeadCached(summaryData.vbCode, leadNameInRow);
        if (lead) {
          currentLeadUser = lead;
          currentVbCode = summaryData.vbCode;
          currentLeadName = leadNameInRow;
          currentSummaryRow = summaryData;
          leadSummaryData.set(lead.id, summaryData);
          inPersonBlock = true;
          localPlcIds.clear(); // Clear local PLC tracking for new lead
        }
      } else if (lead) {
        // Clear local PLC tracking if we were already in a block but found a new summary row for same/new lead
        if (currentSummaryRow) {
          // Merge summary data (prefer non-null values from current row)
          const merged = { ...currentSummaryRow };
          Object.keys(summaryData).forEach(key => {
            if (summaryData[key] !== null && summaryData[key] !== undefined) {
              merged[key] = summaryData[key];
            }
          });
          currentSummaryRow = merged;
          leadSummaryData.set(lead.id, merged);
        } else {
          currentSummaryRow = summaryData;
          leadSummaryData.set(lead.id, summaryData);
        }
      }
      
      // Continue to next row - summary rows don't create placement records
      continue;
    }

    // If we're in a person block but haven't found the lead yet, try to extract from current row
    if (inPersonBlock && !currentLeadUser) {
      const vbCode = vbCodeInRow;
      const leadName = leadNameInRow;
      
      // Only update if we find actual values (not empty/null)
      if (vbCode || leadName) {
        if (vbCode) currentVbCode = vbCode;
        if (leadName) currentLeadName = leadName;
        
        if (currentVbCode || currentLeadName) {
          currentLeadUser = findLeadCached(currentVbCode, currentLeadName);
          if (!currentLeadUser) {
            throw new Error(
              `Row ${rowIndex}: could not resolve lead for VB Code "${currentVbCode}" / Lead Name "${currentLeadName}"`
            );
          }
        }
      }
    }

    // Skip header rows - check if candidate name or lead name matches header text
    if (!candidateNameRaw) {
      continue;
    }
    const candidateNameNorm = String(candidateNameRaw).trim().toLowerCase();
    const leadNameNorm = leadNameInRow ? String(leadNameInRow).trim().toLowerCase() : "";
    const vbCodeNorm = vbCodeInRow ? String(vbCodeInRow).trim().toLowerCase() : "";
    
    // Skip if this is a header row (matches common header text)
    const headerTexts = ["candidate name", "vb code", "recruiter name", "lead name", "lead", "placement year", "doj", "doq", "client", "plc id", "placement type", "billing status"];
    if (headerTexts.includes(candidateNameNorm) || headerTexts.includes(leadNameNorm) || headerTexts.includes(vbCodeNorm)) {
      continue; // header rows inside the block
    }

    // Use current lead from block, or try to find from row
    let leadUser = currentLeadUser;
    if (!leadUser) {
      const vbCode = getVal(row, "vb code");
      const leadName = getVal(row, "lead name") || getVal(row, "lead");
      
      // Skip if lead name is actually a team name (like "Vantedge")
      if (leadName && teamNames.has(String(leadName).trim().toLowerCase())) {
        continue; // Skip this row - it's a team name, not a lead name
      }
      
      leadUser = await findLeadByVbOrName(vbCode, leadName);
      if (!leadUser) {
        // Skip rows where we can't find the lead instead of failing entire import
        continue;
      }
      // Update current tracking and mark as in person block
      inPersonBlock = true;
      currentVbCode = vbCode;
      currentLeadName = leadName;
      currentLeadUser = leadUser;
    }

    // PLC ID
    const plcIdRaw = getVal(row, "plc id") || getVal(row, "pls id");
    const plcId = String(plcIdRaw || "").trim();
    if (!plcId) {
      throw new Error(`Row ${rowIndex}: missing PLC ID`);
    }
    
    // Check for duplicates within the current lead's block to prevent local duplicates
    if (inPersonBlock && currentLeadUser) {
      const normalizedPlcId = plcId.toLowerCase();
      if (!shouldSkipDuplicateCheck(plcId)) {
        if (localPlcIds.has(normalizedPlcId)) {
          console.log(`Skipping duplicate PLC ID ${plcId} for lead ${currentLeadUser.name} in same sheet block`);
          continue; // Skip this row as it's a duplicate in the same sheet for the same lead
        }
        localPlcIds.add(normalizedPlcId);
      }
    }
    
    plcIds.push(plcId);

    const placementYear = parseNum(getVal(row, "placement year"));

    const doj = parseDateCell(getVal(row, "doj"));
    if (!doj) {
      throw new Error(`Row ${rowIndex}: invalid DOJ`);
    }

    // Candidate Deduplication: Find existing placement (Lead, Candidate, Client, DOJ, Level, PLC ID)
    const client = String(getVal(row, "client") || "").trim();
    const candidateName = String(getVal(row, "candidate name") || "").trim();
    const existingPlacement = await findExistingTeamPlacement(leadUser.id, candidateName, client, doj, leadUser.level || "L2", plcId);
    
    if (existingPlacement) {
      console.log(`Row ${rowIndex}: Found existing team placement for candidate ${candidateName} (ID: ${existingPlacement.id}). Will update.`);
    }

    const doq = parseDateCell(getVal(row, "doq"));

    const totalBilledHours = parseNum(getVal(row, "total billed hours"));

    const revenueLeadUsd = parseCurrency(
      getVal(row, "revenue -lead (usd)")
    );
    const incentiveInr = parseCurrency(getVal(row, "incentive amount (inr)"));
    const incentivePaidInr = parseCurrency(getVal(row, "incentive paid (inr)"));

    const yearlyPlacementTarget = parseCurrency(
      getVal(row, "yearly placement target")
    );
    const placementDone = parseNum(getVal(row, "placement done"));

    const placementAchPercent = sanitizePercent(getVal(row, "placement ach %"));

    const yearlyRevenueTarget = parseCurrency(
      getVal(row, "yearly revenue target")
    );
    const revenueAch = parseCurrency(getVal(row, "revenue ach"));

    const revenueTargetAchievedPercent = sanitizePercent(getVal(row, "revenue target achieved %"));

    const totalRevenueGenerated = parseCurrency(
      getVal(row, "total revenue generated (usd)")
    );

    const totalIncentiveInr = parseCurrency(
      getVal(row, "total incentive in inr")
    );
    const totalIncentivePaidInr = parseCurrency(
      getVal(row, "total incentive in inr (paid)")
    );

    // Get summary data for this lead (from summary row or current block)
    const summaryData = leadSummaryData.get(leadUser.id) || currentSummaryRow || {};

    // Merge fields: BOTH are equally important - prefer placement row values if they exist, use summary as fallback
    // This ensures we preserve data from both sources without overwriting placement-specific data
    const finalYearlyPlacementTarget = (yearlyPlacementTarget !== null && yearlyPlacementTarget !== undefined)
      ? yearlyPlacementTarget
      : (summaryData.yearlyPlacementTarget !== null && summaryData.yearlyPlacementTarget !== undefined
          ? summaryData.yearlyPlacementTarget
          : null);
    
    const finalPlacementDone = (placementDone !== null && placementDone !== undefined)
      ? placementDone
      : (summaryData.placementDone !== null && summaryData.placementDone !== undefined
          ? summaryData.placementDone
          : null);
    
    const finalPlacementAchPercent = (placementAchPercent !== null && placementAchPercent !== undefined)
      ? placementAchPercent
      : (summaryData.placementAchPercent !== null && summaryData.placementAchPercent !== undefined
          ? summaryData.placementAchPercent
          : null);
    
    const finalYearlyRevenueTarget = (yearlyRevenueTarget !== null && yearlyRevenueTarget !== undefined)
      ? yearlyRevenueTarget
      : (summaryData.yearlyRevenueTarget !== null && summaryData.yearlyRevenueTarget !== undefined
          ? summaryData.yearlyRevenueTarget
          : null);
    
    const finalRevenueAch = (revenueAch !== null && revenueAch !== undefined)
      ? revenueAch
      : (summaryData.revenueAch !== null && summaryData.revenueAch !== undefined
          ? summaryData.revenueAch
          : null);
    
    const finalRevenueTargetAchievedPercent = (revenueTargetAchievedPercent !== null && revenueTargetAchievedPercent !== undefined)
      ? revenueTargetAchievedPercent
      : (summaryData.revenueTargetAchievedPercent !== null && summaryData.revenueTargetAchievedPercent !== undefined
          ? summaryData.revenueTargetAchievedPercent
          : null);
    
    const finalTotalRevenueGenerated = (totalRevenueGenerated !== null && totalRevenueGenerated !== undefined)
      ? totalRevenueGenerated
      : (summaryData.totalRevenueGenerated !== null && summaryData.totalRevenueGenerated !== undefined
          ? summaryData.totalRevenueGenerated
          : null);
    
    const slabFromRow = getVal(row, "slab qualified");
    const finalSlabQualified = (slabFromRow && String(slabFromRow).trim())
      ? String(slabFromRow).trim()
      : (summaryData.slabQualified
          ? String(summaryData.slabQualified).trim()
          : null);
    
    const finalTotalIncentiveInr = (totalIncentiveInr !== null && totalIncentiveInr !== undefined)
      ? totalIncentiveInr
      : (summaryData.totalIncentiveInr !== null && summaryData.totalIncentiveInr !== undefined
          ? summaryData.totalIncentiveInr
          : null);
    
    const finalTotalIncentivePaidInr = (totalIncentivePaidInr !== null && totalIncentivePaidInr !== undefined)
      ? totalIncentivePaidInr
      : (summaryData.totalIncentivePaidInr !== null && summaryData.totalIncentivePaidInr !== undefined
          ? summaryData.totalIncentivePaidInr
          : null);

    preparedRows.push({
      id: existingPlacement ? existingPlacement.id : undefined,
      leadId: leadUser.id,
      level: leadUser.level || "L2", // Use lead level (usually L2) for team placements
      candidateName: String(getVal(row, "candidate name") || "").trim(),
      recruiterName: getVal(row, "recruiter name")
        ? String(getVal(row, "recruiter name")).trim()
        : null,
      leadName: (hasLeadHeader && currentLeadName) ? String(currentLeadName).trim() : null,
      splitWith: (hasSplitHeader && getVal(row, "split with"))
        ? String(getVal(row, "split with")).trim()
        : null,
      placementYear,
      doj,
      doq,
      client: String(getVal(row, "client") || "").trim(),
      plcId,
      placementType: String(getVal(row, "placement type") || "").trim(), // Store exact value from sheet
      billingStatus: String(getVal(row, "billing status") || "").trim(),
      collectionStatus: getVal(row, "collection status")
        ? String(getVal(row, "collection status")).trim()
        : null,
      totalBilledHours,
      revenueLeadUsd,
      incentiveInr,
      incentivePaidInr,
      vbCode: summaryData.vbCode || (currentVbCode ? String(currentVbCode).trim() : null),
      yearlyPlacementTarget: finalYearlyPlacementTarget,
      placementDone: finalPlacementDone,
      placementAchPercent: finalPlacementAchPercent,
      yearlyRevenueTarget: finalYearlyRevenueTarget,
      revenueAch: finalRevenueAch,
      revenueTargetAchievedPercent: finalRevenueTargetAchievedPercent,
      totalRevenueGenerated: finalTotalRevenueGenerated,
      slabQualified: finalSlabQualified,
      totalIncentiveInr: finalTotalIncentiveInr,
      totalIncentivePaidInr: finalTotalIncentivePaidInr,
    });
  }

  if (preparedRows.length === 0 && leadSummaryData.size === 0) {
    console.log("No valid placements or summary data found in sheet.");
    return {
      summary: {
        placementsCreated: 0,
        placementsUpdated: 0,
        employeesUpdated: 0,
      },
      batchId: null,
      errors: [],
    };
  }

  // Helper to check if PLC ID should skip duplicate validation
  const shouldSkipDuplicateCheck = (plcId) => {
    const normalized = String(plcId || "").trim().toLowerCase();
    return normalized === "plc-passthrough" || normalized === "0" || normalized === "";
  };

  // Duplicate PLC IDs within payload - allow them but use the last occurrence (skip "PLC-Passthrough" and "0")
  // PLC ID is ALWAYS unique globally - so we deduplicate by plcId only
  const seenPlcIdsInSheet = new Map(); // plcId -> index
  const duplicatePlcIdsInSheet = new Set();
  for (let i = 0; i < preparedRows.length; i++) {
    const row = preparedRows[i];
    const plcId = row.plcId;
    if (shouldSkipDuplicateCheck(plcId)) continue;
    
    const normalizedPlcId = String(plcId).trim().toLowerCase();
    
    if (seenPlcIdsInSheet.has(normalizedPlcId)) {
      duplicatePlcIdsInSheet.add(plcId);
      const earlierIndex = seenPlcIdsInSheet.get(normalizedPlcId);
      // Remove the earlier occurrence
      preparedRows.splice(earlierIndex, 1);
      i--; // Adjust current index after removal
      
      // Update indices of all subsequent seen items in the map
      for (const [key, idx] of seenPlcIdsInSheet.entries()) {
        if (idx > earlierIndex) {
          seenPlcIdsInSheet.set(key, idx - 1);
        }
      }
    }
    seenPlcIdsInSheet.set(normalizedPlcId, i);
  }
  // Log warning but don't fail - duplicates will be handled by update logic
  if (duplicatePlcIdsInSheet.size > 0) {
    console.warn(`Warning: Duplicate PLC ID(s) in team sheet (using last occurrence): ${Array.from(duplicatePlcIdsInSheet).join(", ")}`);
  }

  console.log(`Prepared ${preparedRows.length} rows for team placement. Starting transaction...`);
  // Increase transaction timeout to 60 seconds for large imports
  const result = await prisma.$transaction(async (tx) => {
    const rowsToInsert = [];
    const rowsToUpdate = [];

    // Separate rows into insert and update based on whether an ID was found
    for (const row of preparedRows) {
      if (row.id) {
        // Remove the id from the row data before updating to avoid primary key conflicts
        const { id, ...data } = row;
        rowsToUpdate.push({ id, data });
      } else {
        // New placement, check if it has required placement data
        if (row.candidateName && row.doj && row.client) {
          const { id, ...data } = row; // id is undefined anyway
          rowsToInsert.push(data);
        }
      }
    }

    const batch = await tx.placementImportBatch.create({
      data: {
        type: "TEAM",
        uploaderId: actorId,
      },
    });

    // Update existing records
    let updatedCount = 0;
    for (const item of rowsToUpdate) {
      await tx.teamPlacement.update({
        where: { id: item.id },
        data: {
          ...item.data,
          batchId: batch.id,
        },
      });
      updatedCount++;
    }

    // Insert new records
    let insertedCount = 0;
    if (rowsToInsert.length > 0) {
      await tx.teamPlacement.createMany({
        data: rowsToInsert.map((r) => ({
          ...r,
          batchId: batch.id,
        })),
      });
      insertedCount = rowsToInsert.length;
    }

    // Update EmployeeProfile targets for leads based on summary data
    // Ensure every lead found in summary rows but without placements is added to leadUpdates
    const leadUpdates = new Map();
    for (const [leadId, summaryData] of leadSummaryData) {
      leadUpdates.set(leadId, {
        leadId,
        yearlyPlacementTarget: summaryData.yearlyPlacementTarget,
        yearlyRevenueTarget: summaryData.yearlyRevenueTarget,
        placementDone: summaryData.placementDone,
        placementAchPercent: summaryData.placementAchPercent,
        revenueAch: summaryData.revenueAch,
        revenueTargetAchievedPercent: summaryData.revenueTargetAchievedPercent,
        totalRevenue: summaryData.totalRevenueGenerated,
        slabQualified: summaryData.slabQualified,
        totalIncentiveAmount: summaryData.totalIncentiveInr,
        totalIncentivePaid: summaryData.totalIncentivePaidInr,
      });
    }

    // Now merge in data from placement rows if summary row data was missing
    for (const row of preparedRows) {
      if (!leadUpdates.has(row.leadId)) {
        leadUpdates.set(row.leadId, {
          leadId: row.leadId,
          yearlyPlacementTarget: null,
          yearlyRevenueTarget: null,
          placementDone: null,
          placementAchPercent: null,
          revenueAch: null,
          revenueTargetAchievedPercent: null,
          totalRevenue: null,
          slabQualified: null,
          totalIncentiveAmount: null,
          totalIncentivePaid: null,
        });
      }
      const update = leadUpdates.get(row.leadId);
      // Only use placement row data if summary row data didn't already provide it
      if (update.yearlyPlacementTarget === null && row.yearlyPlacementTarget !== null && row.yearlyPlacementTarget !== undefined) {
        update.yearlyPlacementTarget = row.yearlyPlacementTarget;
      }
      if (update.yearlyRevenueTarget === null && row.yearlyRevenueTarget !== null && row.yearlyRevenueTarget !== undefined) {
        update.yearlyRevenueTarget = row.yearlyRevenueTarget;
      }
      if (update.placementDone === null && row.placementDone !== null && row.placementDone !== undefined) {
        update.placementDone = row.placementDone;
      }
      if (update.placementAchPercent === null && row.placementAchPercent !== null && row.placementAchPercent !== undefined) {
        update.placementAchPercent = row.placementAchPercent;
      }
      if (update.revenueAch === null && row.revenueAch !== null && row.revenueAch !== undefined) {
        update.revenueAch = row.revenueAch;
      }
      if (update.revenueTargetAchievedPercent === null && row.revenueTargetAchievedPercent !== null && row.revenueTargetAchievedPercent !== undefined) {
        update.revenueTargetAchievedPercent = row.revenueTargetAchievedPercent;
      }
      if (update.totalRevenue === null && row.totalRevenueGenerated !== null && row.totalRevenueGenerated !== undefined) {
        update.totalRevenue = row.totalRevenueGenerated;
      }
      if (update.slabQualified === null && row.slabQualified !== null && row.slabQualified !== undefined) {
        update.slabQualified = row.slabQualified;
      }
      if (update.totalIncentiveAmount === null && row.totalIncentiveInr !== null && row.totalIncentiveInr !== undefined) {
        update.totalIncentiveAmount = row.totalIncentiveInr;
      }
      if (update.totalIncentivePaid === null && row.totalIncentivePaidInr !== null && row.totalIncentivePaidInr !== undefined) {
        update.totalIncentivePaid = row.totalIncentivePaidInr;
      }
      if (update.individualSynopsis === null && row.individualSynopsis !== null && row.individualSynopsis !== undefined) {
        update.individualSynopsis = row.individualSynopsis;
      }
    }

    // Fetch teams to identify Vantage teams
    const teams = await tx.team.findMany({ select: { id: true, name: true } });
    const vantageTeamIds = new Set(
      teams.filter(t => t.name.toLowerCase().includes('vant')).map(t => t.id)
    );

    // Update each lead's profile
    console.log(`Updating ${leadUpdates.size} lead profiles...`);
    let leadUpdateCounter = 0;
    for (const [leadId, data] of leadUpdates) {
      leadUpdateCounter++;
      console.log(`Updating lead profile ${leadUpdateCounter}/${leadUpdates.size}: ${leadId}`);
      const profile = await tx.employeeProfile.findUnique({
        where: { id: leadId },
        include: { team: { select: { id: true, name: true } } },
      });

      if (!profile) continue;

      const isVantage = profile.teamId && vantageTeamIds.has(profile.teamId);
      const updateData = {};

      if (isVantage) {
        // Vantage: REVENUE-based targets (but also have placement targets)
        if (data.yearlyRevenueTarget !== null) {
          updateData.yearlyTarget = data.yearlyRevenueTarget;
          updateData.yearlyRevenueTarget = data.yearlyRevenueTarget;
        } else if (profile.yearlyRevenueTarget !== null) {
          updateData.yearlyTarget = profile.yearlyRevenueTarget;
        }
        updateData.targetType = 'REVENUE';
        // Store placement target if provided (for dual-target display)
        if (data.yearlyPlacementTarget !== null) {
          updateData.yearlyPlacementTarget = data.yearlyPlacementTarget;
        }
      } else {
        // Non-Vantage: Usually PLACEMENTS-based, but could be REVENUE-based
      if (data.yearlyPlacementTarget !== null) {
        updateData.yearlyTarget = data.yearlyPlacementTarget;
        updateData.yearlyPlacementTarget = data.yearlyPlacementTarget;
        updateData.targetType = 'PLACEMENTS';
        // Use placement-specific achievement percent if available
        if (data.placementAchPercent !== null) {
          updateData.revenueTargetAchievedPercent = data.placementAchPercent;
        }
      } else if (data.yearlyRevenueTarget !== null) {
          // Fallback to revenue target if no placement target is provided
          updateData.yearlyTarget = data.yearlyRevenueTarget;
          updateData.yearlyRevenueTarget = data.yearlyRevenueTarget;
          updateData.targetType = 'REVENUE';
        } else if (profile.yearlyTarget !== null) {
          // Keep existing target if no new target is provided
          updateData.yearlyTarget = profile.yearlyTarget;
        }
      }

      // Update all summary fields from summary data
      if (data.placementDone !== null) {
        updateData.placementsDone = data.placementDone;
      }
      if (data.revenueAch !== null) {
        updateData.revenueAch = data.revenueAch;
      }
      if (data.revenueTargetAchievedPercent !== null) {
        updateData.revenueTargetAchievedPercent = data.revenueTargetAchievedPercent;
      }
      if (data.totalRevenue !== null) {
        updateData.totalRevenue = data.totalRevenue;
      }
      if (data.slabQualified !== null) {
        updateData.slabQualified = data.slabQualified;
      }
      if (data.totalIncentiveAmount !== null) {
        updateData.totalIncentiveAmount = data.totalIncentiveAmount;
      }
      if (data.totalIncentivePaid !== null) {
        updateData.totalIncentivePaid = data.totalIncentivePaid;
      }
      if (data.individualSynopsis !== null) {
        updateData.individualSynopsis = data.individualSynopsis;
      }

      if (Object.keys(updateData).length > 0) {
        await tx.employeeProfile.update({
          where: { id: leadId },
          data: updateData,
        });
      }
    }

    await tx.auditLog.create({
      data: {
        actorId,
        action: "TEAM_PLACEMENTS_IMPORTED",
        entityType: "PlacementImportBatch",
        entityId: batch.id,
        changes: {
          inserted: insertedCount,
          updated: updatedCount,
          total: preparedRows.length,
        },
      },
    });

    return {
      summary: {
        placementsCreated: insertedCount,
        placementsUpdated: updatedCount,
        employeesUpdated: leadUpdates.size,
      },
      batchId: batch.id,
    };
  }, {
    timeout: 60000, // 60 seconds timeout for large imports
  });

  return { ...result, errors: [] };
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
    },
  });

  return placement;
}

export async function bulkDeletePlacements(placementIds, actorId) {
  const result = await prisma.placement.deleteMany({
    where: {
      id: { in: placementIds },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_BULK_DELETED",
      entityType: "Placement",
      changes: { count: result.count, ids: placementIds },
    },
  });

  return result;
}

export async function deleteAllPlacements(actorId) {
  return await prisma.$transaction(async (tx) => {
    // Delete from all three placement models
    const personalCount = await tx.personalPlacement.deleteMany({});
    const teamCount = await tx.teamPlacement.deleteMany({});
    const oldPlacementCount = await tx.placement.deleteMany({});
    
    // Also delete import batches to be thorough
    const batchCount = await tx.placementImportBatch.deleteMany({});

    await tx.auditLog.create({
      data: {
        actorId,
        action: "ALL_PLACEMENTS_DELETED",
        entityType: "Placement",
        changes: {
          personal: personalCount.count,
          team: teamCount.count,
          old: oldPlacementCount.count,
          batches: batchCount.count,
        },
      },
    });

    return {
      personal: personalCount.count,
      team: teamCount.count,
      old: oldPlacementCount.count,
      batches: batchCount.count,
    };
  });
}


import prisma from "../prisma.js";
import { Role } from "../generated/client/index.js";

// Helper to parse numbers: handles NA, Excel errors, commas, and empty strings
const parseNum = (val, defaultVal = null) => {
  if (val === undefined || val === null) return defaultVal;
  const strVal = String(val).trim().toLowerCase();
  if (strVal === "") return defaultVal;
  // Excel/CSV placeholders and errors
  if (/^(na|n\/a|-|–|—|#n\/a|#ref!|#value!|#div\/0!|#name\?|\s*-\s*)$/.test(strVal)) return defaultVal;

  if (typeof val === "number" && !isNaN(val)) return val;
  // Remove commas (thousands), currency symbols; keep digits, one minus, one decimal point
  const clean = String(val).replace(/,/g, "").replace(/[^0-9.-]/g, "");
  const num = Number(clean);
  return (isNaN(num) || clean === "") ? defaultVal : num;
};

// Alias for parseNum to maintain compatibility with existing code
const parseCurrency = (val) => parseNum(val);

// Cap value to Decimal(5,2) range to avoid DB overflow (max 999.99, min -999.99)
const capDecimal5_2 = (val) => {
  if (val === null || val === undefined) return null;
  const num = parseNum(val);
  if (num === null) return null;
  return Math.min(999.99, Math.max(-999.99, num));
};

// Placement done: store as-is up to Decimal(14,2) max. Reject only negatives.
const PLACEMENT_DONE_MAX = 999999999999.99;
const capPlacementDone = (val) => {
  if (val === null || val === undefined) return null;
  const num = parseNum(val);
  if (num === null || num < 0) return null;
  return Math.min(PLACEMENT_DONE_MAX, Math.max(0, num));
};

// Helper to sanitize numeric values for precision 5, scale 2 (max 999.99)
// Also handles Excel decimal heuristic (e.g. 0.85 for 85%, 1.01 for 101%)
const sanitizePercent = (val) => {
  const num = parseNum(val);
  if (num === null) return null;

  let result = num;
  // Heuristic: 0 < value <= 1 → decimal (0.85 = 85%); 1 < value <= 10 → over-100% decimal (1.01 = 101%, 2.5 = 250%)
  if (result > 0 && result <= 1.0) {
    result = result * 100;
  } else if (result > 1 && result <= 10) {
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

// Shared helper to normalize string headers (collapses spaces around parentheses for consistency)
const normalizeHeader = (h) => {
  let normalized = String(h || "").trim().toLowerCase();
  if (normalized === "pls id") return "plc id";
  normalized = normalized.replace(/\s*\(\s*/g, "(").replace(/\s*\)\s*/g, ")");
  return normalized;
};

const shouldSkipDuplicateCheck = (plcId) => {
  const normalized = String(plcId || "").trim().toLowerCase();
  return normalized === "plc-passthrough" || normalized === "0" || normalized === "";
};

// Helper to parse dates, handling Excel serials, errors (#N/A), and invalid formats
const parseDateCell = (val) => {
  if (val === undefined || val === null || val === "") return null;
  const strVal = String(val).trim().toLowerCase();
  if (strVal === "" || strVal === "na" || strVal === "-" || strVal === "n/a" || strVal === "0") return null;
  if (/^#(n\/a|ref!|value!|div\/0!|name\?)$/.test(strVal)) return null;

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

// Strict L2/L3 team sheet: required summary headers (first block)
const REQUIRED_TEAM_SUMMARY_HEADERS = [
  "team", "vb code", "lead name", "yearly placement target", "placement done", "placement ach %",
  "yearly revenue target", "revenue ach", "revenue target achieved %", "total revenue generated (usd)",
  "slab qualified", "total incentive in inr", "total incentive in inr (paid)"
];

// Strict L2/L3 team sheet: required placement headers (placement block)
const REQUIRED_TEAM_PLACEMENT_HEADERS = [
  "lead name", "candidate name", "recruiter name", "lead", "split with", "placement year", "doj", "doq",
  "client", "plc id", "placement type", "billing status", "collection status", "total billed hours",
  "revenue -lead (usd)", "incentive amount (inr)", "incentive paid (inr)"
];

// Recruiter/personal sheet: summary block (fewer columns than team sheet)
// Required: "yearly target" and "achieved" (legacy "yearly placement target" / "placement done" are not accepted)
const REQUIRED_PERSONAL_SUMMARY_HEADERS = [
  "team", "vb code", "recruiter name", "team lead", "yearly target", "achieved",
  "target achieved %", "total revenue generated (usd)", "slab qualified", "total incentive in inr", "total incentive in inr (paid)"
];
// Aliases: person column (at least one); ach column can be "target achieved %" or "placement ach %"
const PERSONAL_SUMMARY_PERSON_ALIASES = ["recruiter name", "lead name", "lead", "recruiter"];
const PERSONAL_SUMMARY_ACH_ALIASES = ["target achieved %", "placement ach %"];

// Recruiter/personal sheet: placement block
// Recruiter Name, Candidate Name, Placement Year, DOJ, DOQ, Client, PLC ID, Placement Type, Billing Status, Collection Status, Total Billed Hours, Revenue (USD), Incentive amount (INR), Incentive Paid (INR)
const REQUIRED_PERSONAL_PLACEMENT_HEADERS = [
  "recruiter name", "candidate name", "placement year", "doj", "doq", "client", "plc id",
  "placement type", "billing status", "collection status", "total billed hours",
  "revenue (usd)", "incentive amount (inr)", "incentive paid (inr)"
];
const PERSONAL_PLACEMENT_PERSON_ALIASES = ["recruiter name", "lead name", "lead", "vb code"];

function validateRequiredHeaders(normalizedHeaderList, required) {
  const set = new Set(normalizedHeaderList);
  // Required names may have spaces around parentheses; set has normalizeHeader() form (e.g. "total revenue generated(usd)")
  const missing = required.filter((h) => !set.has(normalizeHeader(h)));
  return { valid: missing.length === 0, missing };
}

// Reject legacy headers on personal sheet; require "yearly target" and "achieved"
const PERSONAL_LEGACY_HEADERS = ["yearly placement target", "placement done"];
const PERSONAL_REQUIRED_NEW_HEADERS = ["yearly target", "achieved"];
function rejectLegacyPersonalSummaryHeaders(normalizedHeaderList) {
  const set = new Set(normalizedHeaderList);
  const has = (key) => set.has(normalizeHeader(key));
  const hasBothNew = PERSONAL_REQUIRED_NEW_HEADERS.every((h) => has(h));
  const hasAnyLegacy = PERSONAL_LEGACY_HEADERS.some((h) => has(h));
  if (!hasBothNew && hasAnyLegacy) {
    throw new Error(
      "Personal placement sheet must use headers \"yearly target\" and \"achieved\". " +
      "The headers \"yearly placement target\" and \"placement done\" are no longer accepted. " +
      "Please rename them in your sheet and re-import."
    );
  }
}

// Personal sheet: summary block must have required summary columns + at least one person column
function validatePersonalSummaryHeaders(normalizedHeaderList) {
  rejectLegacyPersonalSummaryHeaders(normalizedHeaderList);
  const set = new Set(normalizedHeaderList);
  const hasPerson = PERSONAL_SUMMARY_PERSON_ALIASES.some((h) => set.has(h));
  const requiredCore = REQUIRED_PERSONAL_SUMMARY_HEADERS.filter((h) => !PERSONAL_SUMMARY_PERSON_ALIASES.includes(h));
  const has = (key) => set.has(normalizeHeader(key));
  const missing = requiredCore.filter((h) => {
    if (PERSONAL_SUMMARY_ACH_ALIASES.includes(h)) return !PERSONAL_SUMMARY_ACH_ALIASES.some((alias) => has(alias));
    return !has(h);
  });
  if (!hasPerson) missing.push("recruiter name or lead name");
  return { valid: missing.length === 0, missing };
}

// Personal sheet: placement block must have required placement columns
function validatePersonalPlacementHeaders(normalizedHeaderList) {
  const set = new Set(normalizedHeaderList);
  const requiredCore = REQUIRED_PERSONAL_PLACEMENT_HEADERS.filter((h) => !PERSONAL_PLACEMENT_PERSON_ALIASES.includes(h));
  const has = (key) => set.has(normalizeHeader(key));
  const missing = requiredCore.filter((h) => !has(h));
  const hasPerson = PERSONAL_PLACEMENT_PERSON_ALIASES.some((h) => set.has(h));
  if (!hasPerson) missing.push("recruiter name or vb code");
  return { valid: missing.length === 0, missing };
}

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

// Lookup helpers (VBID is not unique; findFirst returns first match)
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

async function findLeadByVbOrName(vbCode, leadName, teamName) {
  const teamFilter = teamName && String(teamName).trim()
    ? { team: { name: { equals: String(teamName).trim(), mode: "insensitive" } } }
    : {};
  if (vbCode) {
    const profile = await prisma.employeeProfile.findFirst({
      where: { vbid: String(vbCode).trim(), ...teamFilter },
      include: { user: true },
    });
    if (profile) return profile;
  }
  if (leadName) {
    const profile = await prisma.employeeProfile.findFirst({
      where: {
        user: {
          name: { equals: leadName.trim(), mode: "insensitive" },
        },
        ...teamFilter
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const fetchPromises = [
    prisma.personalPlacement.findMany({
      where: { employeeId: userId },
      orderBy: { createdAt: "desc" },
    }),
  ];
  if (user?.role === Role.TEAM_LEAD) {
    fetchPromises.push(
      prisma.teamPlacement.findMany({
        where: { leadId: userId },
        orderBy: { createdAt: "desc" },
      })
    );
  }

  const results = await Promise.all(fetchPromises);
  const rawPersonalPlacements = results[0];
  const rawTeamPlacements = results[1] || [];

  // Exclude summary-only placeholder rows from personal (and team) lists
  const isSummaryOnlyRow = (p) =>
    (p.plcId && String(p.plcId).startsWith("SUMMARY-")) ||
    (p.candidateName && String(p.candidateName).trim() === "(Summary only)");
  const personalPlacements = rawPersonalPlacements.filter((p) => !isSummaryOnlyRow(p));
  const teamPlacements = rawTeamPlacements.filter((p) => !isSummaryOnlyRow(p));

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
    source: "personal",
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
    source: "team",
  }));

  const allPlacements = [...convertedPersonalPlacements, ...convertedTeamPlacements].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return allPlacements;
}

export async function createPlacement(userId, data, actorId) {
  const err = new Error("Legacy placements are no longer supported. Use placement import.");
  err.statusCode = 410;
  throw err;
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

/** Parse date for placement update; returns null for empty/invalid. */
function parseDateForUpdate(val) {
  if (val === undefined || val === null || val === "") return undefined;
  const d = typeof val === "string" ? new Date(val) : val;
  return isNaN(d?.getTime()) ? undefined : d;
}

/** Update PersonalPlacement or TeamPlacement by id (used by S1 Admin / Super User edit). */
export async function updatePlacement(id, data, actorId) {
  const personal = await prisma.personalPlacement.findUnique({ where: { id } });
  if (personal) {
    const updates = {};
    if (data.candidateName !== undefined) updates.candidateName = String(data.candidateName).trim() || personal.candidateName;
    if (data.placementYear !== undefined) updates.placementYear = data.placementYear !== "" && data.placementYear != null ? Number(data.placementYear) : null;
    if (data.doj !== undefined) { const d = parseDateForUpdate(data.doj); if (d) updates.doj = d; }
    if (data.doq !== undefined) updates.doq = parseDateForUpdate(data.doq) ?? null;
    if (data.client !== undefined) updates.client = String(data.client).trim() || personal.client;
    if (data.plcId !== undefined) updates.plcId = String(data.plcId).trim() || personal.plcId;
    // PersonalPlacement.placementType is a string; store exact value (e.g. C2C) from sheet/edit, do not normalize
    if (data.placementType !== undefined) updates.placementType = String(data.placementType).trim() || personal.placementType;
    // PersonalPlacement.billingStatus is a string; store exact value (e.g. done, pending) from sheet/edit, do not normalize
    if (data.billingStatus !== undefined) updates.billingStatus = String(data.billingStatus).trim() || personal.billingStatus;
    if (data.collectionStatus !== undefined) updates.collectionStatus = data.collectionStatus != null ? String(data.collectionStatus).trim() : null;
    if (data.totalBilledHours !== undefined) updates.totalBilledHours = data.totalBilledHours !== "" && data.totalBilledHours != null ? Number(data.totalBilledHours) : null;
    if (data.revenueUsd !== undefined) updates.revenueUsd = parseNum(data.revenueUsd, 0);
    if (data.incentiveInr !== undefined) updates.incentiveInr = parseNum(data.incentiveInr, 0);
    if (data.incentivePaidInr !== undefined) updates.incentivePaidInr = data.incentivePaidInr != null && data.incentivePaidInr !== "" ? parseNum(data.incentivePaidInr, null) : null;
    if (data.recruiterName !== undefined) updates.recruiterName = data.recruiterName != null ? String(data.recruiterName).trim() : null;
    if (data.teamLeadName !== undefined) updates.teamLeadName = data.teamLeadName != null ? String(data.teamLeadName).trim() : null;
    if (Object.keys(updates).length === 0) return personal;
    const updated = await prisma.personalPlacement.update({ where: { id }, data: updates });
    await prisma.auditLog.create({
      data: { actorId, action: "PLACEMENT_UPDATED", entityType: "PersonalPlacement", entityId: id, changes: updates },
    });
    return updated;
  }

  const team = await prisma.teamPlacement.findUnique({ where: { id } });
  if (team) {
    const updates = {};
    if (data.candidateName !== undefined) updates.candidateName = String(data.candidateName).trim() || team.candidateName;
    if (data.recruiterName !== undefined) updates.recruiterName = data.recruiterName != null ? String(data.recruiterName).trim() : null;
    if (data.leadName !== undefined) updates.leadName = data.leadName != null ? String(data.leadName).trim() : null;
    if (data.splitWith !== undefined) updates.splitWith = data.splitWith != null ? String(data.splitWith).trim() : null;
    if (data.placementYear !== undefined) updates.placementYear = data.placementYear !== "" && data.placementYear != null ? Number(data.placementYear) : null;
    if (data.doj !== undefined) { const d = parseDateForUpdate(data.doj); if (d) updates.doj = d; }
    if (data.doq !== undefined) updates.doq = parseDateForUpdate(data.doq) ?? null;
    if (data.client !== undefined) updates.client = String(data.client).trim() || team.client;
    if (data.plcId !== undefined) updates.plcId = String(data.plcId).trim() || team.plcId;
    // TeamPlacement.placementType is a string; store exact value (e.g. C2C) from sheet/edit, do not normalize
    if (data.placementType !== undefined) updates.placementType = String(data.placementType).trim() || team.placementType;
    // TeamPlacement.billingStatus is a string; store exact value (e.g. done, pending) from sheet/edit, do not normalize
    if (data.billingStatus !== undefined) updates.billingStatus = String(data.billingStatus).trim() || team.billingStatus;
    if (data.collectionStatus !== undefined) updates.collectionStatus = data.collectionStatus != null ? String(data.collectionStatus).trim() : null;
    if (data.totalBilledHours !== undefined) updates.totalBilledHours = data.totalBilledHours !== "" && data.totalBilledHours != null ? Number(data.totalBilledHours) : null;
    if (data.revenueUsd !== undefined) updates.revenueLeadUsd = parseNum(data.revenueUsd, 0);
    if (data.incentiveInr !== undefined) updates.incentiveInr = parseNum(data.incentiveInr, 0);
    if (data.incentivePaidInr !== undefined) updates.incentivePaidInr = data.incentivePaidInr != null && data.incentivePaidInr !== "" ? parseNum(data.incentivePaidInr, null) : null;
    if (Object.keys(updates).length === 0) return team;
    const updated = await prisma.teamPlacement.update({ where: { id }, data: updates });
    await prisma.auditLog.create({
      data: { actorId, action: "PLACEMENT_UPDATED", entityType: "TeamPlacement", entityId: id, changes: updates },
    });
    return updated;
  }

  const err = new Error("Placement not found");
  err.statusCode = 404;
  throw err;
}

export async function updatePlacementBilling(id, billingData, actorId) {
  const err = new Error("Legacy placements are no longer supported. Use placement import.");
  err.statusCode = 410;
  throw err;
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
  const err = new Error("Legacy placements are no longer supported. Use placement import.");
  err.statusCode = 410;
  throw err;
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
  const err = new Error("Legacy placements are no longer supported. Use placement import.");
  err.statusCode = 410;
  throw err;
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

      // Update Profile Information if provided (runs for both new and existing users). Target/slab live in placement sheets only.
      {
          const updateData = {};
          if (vbid) updateData.vbid = String(vbid).trim();
          if (targetType) {
            const t = String(targetType).toUpperCase();
            if (t === "REVENUE" || t === "PLACEMENTS") updateData.targetType = t;
          }
          if (Object.keys(updateData).length > 0) {
            const profile = await prisma.employeeProfile.findUnique({ where: { id: employeeId } });
            if (!profile) {
              await prisma.employeeProfile.create({
                data: { id: employeeId, ...updateData },
              });
            } else {
              const finalUpdates = {};
              if (updateData.vbid != null && !profile.vbid) finalUpdates.vbid = updateData.vbid;
              if (updateData.targetType !== undefined) finalUpdates.targetType = updateData.targetType;
              if (Object.keys(finalUpdates).length > 0) {
                await prisma.employeeProfile.update({
                  where: { id: employeeId },
                  data: finalUpdates,
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
        slabQualified,
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

      // Target/slab live in placement sheets only; only update targetType and hierarchy on profile
      if (isVantageTeam) {
        updateData.targetType = "REVENUE";
      } else {
        updateData.targetType = "PLACEMENTS";
      }

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

// Slab qualified must not be a placement type value (FTE, CONTRACT, PERMANENT) - often wrong column is mapped
const PLACEMENT_TYPE_SLAB_BLACKLIST = new Set(["fte", "contract", "permanent", "permanent full time", "pft"]);
// Summary slabQualified: only allow numeric percentage value (e.g. 85, 85.5, "85%"); store as string. Text/string -> null.
const sanitizeSlabQualified = (val) => {
  if (val == null || val === "") return null;
  const s = String(val).trim().toLowerCase();
  if (!s) return null;
  if (PLACEMENT_TYPE_SLAB_BLACKLIST.has(s)) return null;
  const num = parseNum(val);
  if (num === null) return null;
  return String(num);
};

// Helper to extract ALL summary fields from a row (using header mapping)
const extractSummaryFields = (row, getVal) => {
  const slabRaw = getVal(row, "slab qualified") || getVal(row, "slab") ? String(getVal(row, "slab qualified") || getVal(row, "slab")).trim() : null;
  return {
    vbCode: getVal(row, "vb code") ? String(getVal(row, "vb code")).trim() : null,
    recruiterName: getVal(row, "recruiter name") || getVal(row, "lead name") || getVal(row, "lead") || getVal(row, "recruiter") ? String(getVal(row, "recruiter name") || getVal(row, "lead name") || getVal(row, "lead") || getVal(row, "recruiter")).trim() : null,
    teamLeadName: getVal(row, "team lead") || getVal(row, "team lead name") || getVal(row, "lead name") || getVal(row, "lead") ? String(getVal(row, "team lead") || getVal(row, "team lead name") || getVal(row, "lead name") || getVal(row, "lead")).trim() : null,
    yearlyTarget: parseNum(getVal(row, "yearly target")),
    achieved: parseNum(getVal(row, "achieved")),
    targetAchievedPercent: sanitizePercent(getVal(row, "target achieved %") || getVal(row, "placement ach %") || getVal(row, "achieved %") || getVal(row, "ach %")),
    yearlyRevenueTarget: parseNum(getVal(row, "yearly revenue target") || getVal(row, "revenue target") || getVal(row, "rev target")),
    revenueAch: parseNum(getVal(row, "revenue ach") || getVal(row, "total revenue") || getVal(row, "rev ach")),
    revenueTargetAchievedPercent: sanitizePercent(getVal(row, "revenue target achieved %") || getVal(row, "rev ach %") || getVal(row, "revenue ach %")),
    totalRevenueGenerated: parseNum(getVal(row, "total revenue generated (usd)") || getVal(row, "revenue generated") || getVal(row, "total revenue") || getVal(row, "total revenue generated")),
    slabQualified: sanitizeSlabQualified(slabRaw),
    totalIncentiveInr: parseNum(getVal(row, "total incentive in inr") || getVal(row, "incentive earned") || getVal(row, "total incentive") || getVal(row, "incentive") || getVal(row, "incentive amount")),
    totalIncentivePaidInr: parseNum(getVal(row, "total incentive in inr (paid)") || getVal(row, "incentive paid") || getVal(row, "total incentive paid")),
    individualSynopsis: getVal(row, "individual synopsis") || getVal(row, "synopsis") ? String(getVal(row, "individual synopsis") || getVal(row, "synopsis")).trim() : null,
  };
};

// Helper to extract summary fields from team name row format (fixed indices for sheet: Team, VB Code, Lead Name, Yearly Placement Target, Placement Done, Placement Ach %, Yearly Revenue Target, Revenue Ach, Revenue Target Achieved %, Total Revenue Generated (USD), Slab qualified, ...)
const extractSummaryFromTeamNameRow = (row, isTeamImport = false) => {
  if (isTeamImport) {
    const slabRaw = row[10] != null && row[10] !== "" ? String(row[10]).trim() : null;
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
      slabQualified: sanitizeSlabQualified(slabRaw),
      totalIncentiveInr: parseNum(row[11]),
      totalIncentivePaidInr: parseNum(row[12]) || null,
      individualSynopsis: row[13] ? String(row[13]).trim() : null,
    };
  }
  const slabRaw = row[8] != null && row[8] !== "" ? String(row[8]).trim() : null;
  return {
    vbCode: row[1] ? String(row[1]).trim() : null,
    recruiterName: row[2] ? String(row[2]).trim() : null,
    teamLeadName: row[3] ? String(row[3]).trim() : null,
    yearlyTarget: parseNum(row[4]),
    achieved: parseNum(row[5]),
    targetAchievedPercent: sanitizePercent(row[6]),
    totalRevenueGenerated: parseNum(row[7]),
    slabQualified: sanitizeSlabQualified(slabRaw),
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
    where: { deletedAt: null },
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
    const k = normalizeHeader(key);
    const idx = headerMap[k];
    if (idx === undefined) return null;
    return row[idx];
  };

  // Summary header map: kept when we see a summary block so we can parse summary rows even after a placement block overwrote headerMap
  const summaryHeaderMap = {};
  const getValForSummary = (row, key) => {
    const k = normalizeHeader(key);
    const idx = summaryHeaderMap[k];
    if (idx !== undefined) return row[idx];
    return getVal(row, key);
  };

  // Pre-fetch team names to filter out team names being used as recruiter names
  const teams = await prisma.team.findMany({ select: { name: true } });
  const teamNames = new Set(teams.map(t => t.name.trim().toLowerCase()));

  const plcIds = [];
  const preparedRows = [];
  const batchErrors = []; // Row-level validation errors for import failure tracking

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

  // Validate first header row (from payload headers) – must be either summary or placement style
  const normalizedFirstHeaders = headers.map(normalizeHeader);
  const firstHasSummary = normalizedFirstHeaders.includes("team") && normalizedFirstHeaders.includes("vb code");
  const firstHasPlacement = normalizedFirstHeaders.includes("candidate name") && normalizedFirstHeaders.includes("plc id");
  if (firstHasSummary) {
    const summaryCheck = validatePersonalSummaryHeaders(normalizedFirstHeaders);
    if (!summaryCheck.valid) {
      throw new Error(
        `Invalid recruiter sheet: missing summary headers: ${summaryCheck.missing.join(", ")}. ` +
        `Required (summary block): ${REQUIRED_PERSONAL_SUMMARY_HEADERS.join(", ")} and recruiter name or lead name.`
      );
    }
    // Initialize summary header map from first row so summary rows are parsed correctly even after placement block
    normalizedFirstHeaders.forEach((h, idx) => { if (h) summaryHeaderMap[h] = idx; });
  } else if (firstHasPlacement) {
    const placementCheck = validatePersonalPlacementHeaders(normalizedFirstHeaders);
    if (!placementCheck.valid) {
      throw new Error(
        `Invalid recruiter sheet: missing placement headers: ${placementCheck.missing.join(", ")}. ` +
        `Required (placement block): ${REQUIRED_PERSONAL_PLACEMENT_HEADERS.join(", ")} and recruiter name or vb code.`
      );
    }
  }
  // If neither, validatePersonalHeaders already required at least one person column; allow import to proceed

  console.log(`Processing rows into preparedRows...`);
  for (const row of rows) {
    rowIndex += 1;
    if (rowIndex % 100 === 0) console.log(`Processing row ${rowIndex}...`);

    // Dynamic Header Detection: Detect if this is a header row (Summary or Placement)
    const rowStrings = row.map((c) => String(c || "").trim().toLowerCase()).map(normalizeHeader);
    const hasCandidateHeader = rowStrings.includes("candidate name");
    const hasPlcIdHeader = rowStrings.includes("plc id");
    const hasTeamHeaderRow = rowStrings.includes("team") && rowStrings.includes("vb code");

    if ((hasCandidateHeader && hasPlcIdHeader) || hasTeamHeaderRow) {
      const isPlacementBlock = hasCandidateHeader && hasPlcIdHeader;
      if (isPlacementBlock) {
        const placementCheck = validatePersonalPlacementHeaders(rowStrings);
        if (!placementCheck.valid) {
          throw new Error(
            `Invalid recruiter sheet: placement block missing headers: ${placementCheck.missing.join(", ")}.`
          );
        }
      } else {
        const summaryCheck = validatePersonalSummaryHeaders(rowStrings);
        if (!summaryCheck.valid) {
          throw new Error(
            `Invalid recruiter sheet: summary block missing headers: ${summaryCheck.missing.join(", ")}.`
          );
        }
      }
      console.log(`Row ${rowIndex}: Detected new header row (${isPlacementBlock ? "Placement" : "Summary"}). Updating header mapping.`);
      const newMap = {};
      rowStrings.forEach((h, idx) => {
        if (h) newMap[h] = idx;
      });
      for (const key in headerMap) delete headerMap[key];
      Object.assign(headerMap, newMap);
      if (!isPlacementBlock) {
        for (const key in summaryHeaderMap) delete summaryHeaderMap[key];
        Object.assign(summaryHeaderMap, newMap);
      }
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
          
          // EXTRACT ALL SUMMARY FIELDS FROM THIS ROW (use summary header map so "yearly target"/"achieved" resolve)
          currentSummaryRow = extractSummaryFields(nextRow, getValForSummary);
        }

        if (metricsVbCode || metricsRecruiterName) {
          currentVbCode = metricsVbCode;
          currentRecruiterName = metricsRecruiterName;
          
          // Try to find employee immediately
          currentEmployee = findEmployeeCached(metricsVbCode, metricsRecruiterName);
          if (!currentEmployee && (metricsVbCode || metricsRecruiterName)) {
            batchErrors.push({ rowIndex, message: "Employee not found for VB code / recruiter name" });
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

    // If this is a summary row, extract ALL summary fields (use summary header map so "yearly target"/"achieved" resolve)
    if (isSummaryRow) {
      const summaryData = extractSummaryFields(row, getValForSummary);

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
    const plcId = (plcIdRaw === 0 || plcIdRaw === "0") ? "0" : String(plcIdRaw || "").trim();
    if (!plcId) {
      throw new Error(`Row ${rowIndex}: missing PLC ID`);
    }
    
    // Check for duplicates within the current person's block to prevent local duplicates
    if (inPersonBlock && currentEmployee) {
      const normalizedPlcId = plcId.toLowerCase();
      
      // Helper to check if PLC ID should skip duplicate validation
      const shouldSkipDuplicateCheckLocal = (pId) => {
        const normalized = String(pId || "").trim().toLowerCase();
        return normalized === "plc-passthrough" || normalized === "0" || normalized === "";
      };

      if (!shouldSkipDuplicateCheckLocal(plcId)) {
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

    const yearlyTarget = parseCurrency(getVal(row, "yearly target"));
    const achieved = parseNum(getVal(row, "achieved"));

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

    // Use only this employee's summary row — never currentSummaryRow (which may be another person's or team-level).
    // Otherwise L2/L3 in an L4 sheet get the wrong yearly target from L4's or team summary.
    const summaryData = employeeSummaryData.get(employee.id) || {};

    // Merge fields: prefer placement row values if they exist, then this employee's summary only
    // This ensures we preserve data from both sources without overwriting placement-specific data
    const finalYearlyTarget = (yearlyTarget !== null && yearlyTarget !== undefined)
      ? yearlyTarget
      : (summaryData.yearlyTarget !== null && summaryData.yearlyTarget !== undefined
          ? summaryData.yearlyTarget
          : null);

    const finalAchieved = (achieved !== null && achieved !== undefined)
      ? achieved
      : (summaryData.achieved !== null && summaryData.achieved !== undefined
          ? summaryData.achieved
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
    const rawSlab = (slabFromRow !== null && slabFromRow !== undefined && String(slabFromRow).trim() !== "")
      ? String(slabFromRow).trim()
      : (summaryData.slabQualified !== null && summaryData.slabQualified !== undefined
          ? String(summaryData.slabQualified).trim()
          : null);
    const finalSlabQualified = sanitizeSlabQualified(rawSlab);
    
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
      yearlyTarget: finalYearlyTarget,
      achieved: capPlacementDone(finalAchieved),
      targetAchievedPercent: finalTargetAchievedPercent,
      totalRevenueGenerated: finalTotalRevenueGenerated,
      slabQualified: finalSlabQualified,
      totalIncentiveInr: finalTotalIncentiveInr,
      totalIncentivePaidInr: finalTotalIncentivePaidInr,
    });
  }

  // Persist summary-only recruiters: if an employee has summary data but no placement rows, create one row with summary (same as team import)
  const employeeIdsWithPlacements = new Set(preparedRows.map((r) => r.employeeId));
  const SUMMARY_PLC_PREFIX = "SUMMARY-";
  for (const [employeeId, summaryData] of employeeSummaryData) {
    if (employeeIdsWithPlacements.has(employeeId)) continue;
    const profile = allProfiles.find((p) => p.id === employeeId);
    if (!profile) continue;
    const dojPlaceholder = new Date(Date.UTC(2000, 0, 1));
    preparedRows.push({
      id: undefined,
      employeeId,
      level: profile.level || "L4",
      candidateName: "(Summary only)",
      placementYear: null,
      doj: dojPlaceholder,
      doq: null,
      client: "-",
      plcId: SUMMARY_PLC_PREFIX + employeeId,
      placementType: "-",
      billingStatus: "PENDING",
      collectionStatus: null,
      totalBilledHours: null,
      revenueUsd: 0,
      incentiveInr: 0,
      incentivePaidInr: 0,
      vbCode: summaryData.vbCode ?? null,
      recruiterName: summaryData.recruiterName ?? profile.user?.name ?? null,
      teamLeadName: summaryData.teamLeadName ?? null,
      yearlyTarget: summaryData.yearlyTarget ?? null,
      achieved: capPlacementDone(summaryData.achieved ?? null),
      targetAchievedPercent: summaryData.targetAchievedPercent ?? null,
      totalRevenueGenerated: summaryData.totalRevenueGenerated ?? null,
      slabQualified: summaryData.slabQualified != null && String(summaryData.slabQualified).trim() ? String(summaryData.slabQualified).trim() : null,
      totalIncentiveInr: summaryData.totalIncentiveInr ?? null,
      totalIncentivePaidInr: summaryData.totalIncentivePaidInr ?? null,
    });
  }

  // Resolve existing summary-only rows so we update instead of duplicate
  const summaryOnlyEmployeeIds = [...employeeSummaryData.keys()].filter((id) => !employeeIdsWithPlacements.has(id));
  if (summaryOnlyEmployeeIds.length > 0) {
    const existingSummaryRows = await prisma.personalPlacement.findMany({
      where: { employeeId: { in: summaryOnlyEmployeeIds }, plcId: { startsWith: SUMMARY_PLC_PREFIX } },
      select: { id: true, employeeId: true },
    });
    const existingByEmployeeId = new Map(existingSummaryRows.map((p) => [p.employeeId, p.id]));
    for (const row of preparedRows) {
      if (row.plcId && String(row.plcId).startsWith(SUMMARY_PLC_PREFIX) && existingByEmployeeId.has(row.employeeId)) {
        row.id = existingByEmployeeId.get(row.employeeId);
      }
    }
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
      insertedCount: 0,
      errors: [],
    };
  }

  // Ensure every employee found in summary rows but without placements is added to employeeUpdates
  const employeeUpdates = new Map();
  for (const [employeeId, summaryData] of employeeSummaryData) {
    employeeUpdates.set(employeeId, {
      employeeId,
      yearlyTarget: summaryData.yearlyTarget,
      achieved: summaryData.achieved,
      targetAchievedPercent: summaryData.targetAchievedPercent,
      totalRevenue: summaryData.totalRevenueGenerated,
      slabQualified: summaryData.slabQualified,
      totalIncentiveAmount: summaryData.totalIncentiveInr,
      totalIncentivePaid: summaryData.totalIncentivePaidInr,
    });
  }

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
        errors: batchErrors.length ? batchErrors : undefined,
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

    // When this import added real placement rows for an employee, remove their old summary-only placeholder row
    const employeeIdsWithRealPlacementsInThisImport = new Set(
      preparedRows.filter((r) => !(r.plcId && String(r.plcId).startsWith(SUMMARY_PLC_PREFIX))).map((r) => r.employeeId)
    );
    if (employeeIdsWithRealPlacementsInThisImport.size > 0) {
      await tx.personalPlacement.deleteMany({
        where: {
          employeeId: { in: [...employeeIdsWithRealPlacementsInThisImport] },
          plcId: { startsWith: SUMMARY_PLC_PREFIX },
        },
      });
    }

    // Update EmployeeProfile targetType and yearlyTarget based on team
    // Group by employeeId and collect ALL summary data (from summary rows and placement rows)
    // Summary rows already processed into employeeUpdates above.
    // Now merge in data from placement rows if summary row data was missing for those specific fields.
    for (const row of preparedRows) {
      if (!employeeUpdates.has(row.employeeId)) {
        employeeUpdates.set(row.employeeId, {
          employeeId: row.employeeId,
          yearlyTarget: null,
          achieved: null,
          targetAchievedPercent: null,
          totalRevenue: null,
          slabQualified: null,
          totalIncentiveAmount: null,
          totalIncentivePaid: null,
        });
      }
      const update = employeeUpdates.get(row.employeeId);
      // Only use placement row data if it exists and summary data didn't already provide it
      if (update.yearlyTarget === null && row.yearlyTarget !== null && row.yearlyTarget !== undefined) {
        update.yearlyTarget = row.yearlyTarget;
      }
      if (update.achieved === null && row.achieved !== null && row.achieved !== undefined) {
        update.achieved = row.achieved;
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

        // Vantage team (name contains "vant") = REVENUE; all other teams = PLACEMENTS. Target/slab live in placement sheets only.
        const isVantage = profile.team?.name?.toLowerCase().includes('vant');
        const updateData = { targetType: isVantage ? 'REVENUE' : 'PLACEMENTS' };
        await tx.employeeProfile.update({
          where: { id: employeeId },
          data: updateData,
        });
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
      errors: batchErrors,
    };
  }, {
    timeout: 60000, // 60 seconds timeout for large imports
  });

  console.log(`Transaction finished for importPersonalPlacements. Result: ${JSON.stringify(result)}`);
  return {
    ...result,
    insertedCount: result.summary?.placementsCreated ?? 0,
    errors: result.errors ?? [],
  };
}

export async function importTeamPlacements(payload, actorId) {
  const { headers, rows, teamId } = payload || {};

  console.log(`Starting importTeamPlacements with ${rows?.length} rows, teamId=${teamId || "none"}`);

  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error("headers and rows must be arrays");
  }

  // Resolve panel team name when uploading from a team management panel (only accept data for this team)
  let expectedTeamName = null;
  if (teamId) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { name: true },
    });
    if (!team) throw new Error("Invalid team ID");
    expectedTeamName = team.name.trim();
  }

  const normalizedHeaders = headers.map(normalizeHeader);
  const hasSummaryHeaderRow = normalizedHeaders.includes("team") && normalizedHeaders.includes("vb code");
  const hasPlacementHeaderRow = normalizedHeaders.includes("candidate name") && normalizedHeaders.includes("plc id");
  if (teamId) {
    if (hasSummaryHeaderRow) {
      const summaryCheck = validateRequiredHeaders(normalizedHeaders, REQUIRED_TEAM_SUMMARY_HEADERS);
      if (!summaryCheck.valid) {
        throw new Error(
          `Invalid team sheet: missing summary headers: ${summaryCheck.missing.join(", ")}. ` +
          `Required: ${REQUIRED_TEAM_SUMMARY_HEADERS.join(", ")}`
        );
      }
    } else if (hasPlacementHeaderRow) {
      const placementCheck = validateRequiredHeaders(normalizedHeaders, REQUIRED_TEAM_PLACEMENT_HEADERS);
      if (!placementCheck.valid) {
        throw new Error(
          `Invalid team sheet: missing placement headers: ${placementCheck.missing.join(", ")}. ` +
          `Required: ${REQUIRED_TEAM_PLACEMENT_HEADERS.join(", ")}`
        );
      }
      report.placementHeaderValid = true;
    } else {
      throw new Error(
        "Invalid team sheet: first header row must be summary (Team, VB Code, Lead Name, ...) or placement (Lead Name, Candidate Name, PLC ID, ...)."
      );
    }
  }

  const { headerMap, hasLeadHeader: initialHasLeadHeader, hasSplitHeader: initialHasSplitHeader } = validateTeamHeaders(headers);
  let hasLeadHeader = initialHasLeadHeader;
  let hasSplitHeader = initialHasSplitHeader;
  console.log(`Headers validated. hasLeadHeader: ${hasLeadHeader}`);

  // Report for import result dialog
  const report = {
    summaryRowsChecked: 0,
    summaryRowsAccepted: 0,
    summaryRowsRejectedWrongTeam: 0,
    placementRowsChecked: 0,
    placementsCreated: 0,
    placementsUpdated: 0,
    placementsRejectedWrongTeam: 0,
    placementsRejectedLeadNotFound: 0,
    placementHeaderValid: false,
  };

  // Pre-fetching users and profiles for caching (include team so we can filter by sheet team name)
  console.log("Pre-fetching users and profiles for team import...");
  const allProfiles = await prisma.employeeProfile.findMany({
    where: { deletedAt: null },
    include: { user: true, team: { select: { name: true } } }
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

  const teamNameMatches = (profile, sheetTeamName) => {
    if (!sheetTeamName || !profile.team?.name) return true;
    return String(profile.team.name).trim().toLowerCase() === String(sheetTeamName).trim().toLowerCase();
  };

  // Resolve lead by VB Code or Lead Name; when sheetTeamName is provided, only return if profile's team matches
  const findLeadCached = (vbCode, leadName, sheetTeamName) => {
    if (leadName) {
      const byName = profileByName.get(String(leadName).trim().toLowerCase());
      if (byName && teamNameMatches(byName, sheetTeamName)) return byName;
    }
    if (vbCode) {
      const byVb = profileByVb.get(String(vbCode).trim().toLowerCase());
      if (byVb && teamNameMatches(byVb, sheetTeamName)) return byVb;
    }
    return null;
  };

  const getVal = (row, key) => {
    const k = normalizeHeader(key);
    const idx = headerMap[k];
    if (idx === undefined) return null;
    return row[idx];
  };

  // Pre-fetch team names to filter out team names being used as lead names
  const teams = await prisma.team.findMany({ select: { name: true } });
  const teamNames = new Set(teams.map(t => t.name.trim().toLowerCase()));

  const plcIds = [];
  const preparedRows = [];
  const batchErrors = []; // Row-level validation errors for import failure tracking

  // Store summary data per lead (extracted from summary rows)
  const leadSummaryData = new Map(); // leadId -> summary object

  let rowIndex = 0;
  let currentVbCode = null;
  let currentLeadName = null;
  let currentLeadUser = null;
  let currentTeamName = null;
  let inPersonBlock = false;
  let currentSummaryRow = null; // Store the summary row data
  let currentSummaryHeaderRow = null; // Team sheet: summary block header (Team, VB Code, Yearly Revenue Target, Slab qualified, ...)
  const localPlcIds = new Set(); // Track PLC IDs within the current lead block

  // Find the "Team" column index (usually first column)
  const teamColIdx = headerMap["team"] !== undefined ? headerMap["team"] : 0;

  const isSheetTeamMatchingPanel = (sheetTeamName) => {
    if (!expectedTeamName) return true;
    if (!sheetTeamName || !String(sheetTeamName).trim()) return false;
    return String(sheetTeamName).trim().toLowerCase() === expectedTeamName.toLowerCase();
  };

  const buildGetValFromHeaderRow = (headerRow) => {
    const map = {};
    (headerRow || []).forEach((h, idx) => {
      const k = String(h || "").trim().toLowerCase();
      if (k) map[k] = idx;
    });
    return (row, key) => {
      const idx = map[key] ?? map[key.replace(/\s*\([^)]*\)/g, "").trim()];
      if (idx === undefined) return null;
      return row[idx];
    };
  };

  console.log("Processing rows into preparedRows for team import...");

  for (const row of rows) {
    rowIndex += 1;
    if (rowIndex % 50 === 0) console.log(`Processing row ${rowIndex}/${rows.length}...`);

    // Dynamic Header Detection: If row contains "Candidate Name" and "PLC ID", it's the placement header
    const rowStrings = row.map(c => String(c || "").trim().toLowerCase()).map(normalizeHeader);
    const hasCandidateHeader = rowStrings.includes("candidate name");
    const hasPlcIdHeader = rowStrings.includes("plc id");

    if (hasCandidateHeader && hasPlcIdHeader) {
      console.log(`Row ${rowIndex}: Detected placement header row. Updating header mapping.`);
      if (teamId) {
        const placementCheck = validateRequiredHeaders(rowStrings, REQUIRED_TEAM_PLACEMENT_HEADERS);
        if (!placementCheck.valid) {
          throw new Error(
            `Invalid team sheet: placement block missing headers: ${placementCheck.missing.join(", ")}.`
          );
        }
      }
      report.placementHeaderValid = true;
      currentSummaryHeaderRow = null;
      const newMap = {};
      rowStrings.forEach((h, idx) => {
        if (h) newMap[h] = idx;
      });
      Object.assign(headerMap, newMap);
      hasLeadHeader = newMap["lead name"] !== undefined || newMap["lead"] !== undefined;
      hasSplitHeader = newMap["split with"] !== undefined;
      continue;
    }

    // Team sheet: first data row (rowIndex === 1) with summary header = summary row (don't rely on team name in DB)
    const hasSummaryHeaderMap = headerMap["yearly revenue target"] !== undefined || headerMap["vb code"] !== undefined;
    const vbCodeVal = getVal(row, "vb code");
    const leadNameVal = getVal(row, "lead name") || getVal(row, "lead");
    const candidateVal = getVal(row, "candidate name");
    if (rowIndex === 1 && hasSummaryHeaderMap && (vbCodeVal || leadNameVal) && !candidateVal) {
      report.summaryRowsChecked += 1;
      const teamNameFromRow = getVal(row, "team") ?? (row[teamColIdx] != null ? String(row[teamColIdx]).trim() : null);
      if (expectedTeamName && !isSheetTeamMatchingPanel(teamNameFromRow)) {
        report.summaryRowsRejectedWrongTeam += 1;
        continue;
      }
      const summaryData = extractSummaryFields(row, getVal);
      summaryData.leadName = summaryData.recruiterName || summaryData.teamLeadName || (row[2] != null ? String(row[2]).trim() : null) || leadNameVal;
      summaryData.placementAchPercent = summaryData.targetAchievedPercent ?? null; // team expects placementAchPercent
      let leadUser = findLeadCached(summaryData.vbCode || vbCodeVal, summaryData.leadName || leadNameVal, teamNameFromRow);
      if (!leadUser && (vbCodeVal || leadNameVal)) {
        leadUser = await findLeadByVbOrName(vbCodeVal || summaryData.vbCode, leadNameVal || summaryData.leadName, teamNameFromRow);
      }
      if (leadUser) {
        report.summaryRowsAccepted += 1;
        currentLeadUser = leadUser;
        currentVbCode = summaryData.vbCode || vbCodeVal;
        currentLeadName = summaryData.leadName || leadNameVal;
        currentTeamName = teamNameFromRow || null;
        currentSummaryRow = summaryData;
        leadSummaryData.set(leadUser.id, summaryData);
        inPersonBlock = true;
        localPlcIds.clear();
        console.log(`Row ${rowIndex}: Parsed team summary row (first row) for lead ${leadUser.user?.name || leadUser.id}. yearlyRevenueTarget=${summaryData.yearlyRevenueTarget}, slabQualified=${summaryData.slabQualified}`);
      }
      continue;
    }

    // Team sheet: row with first cell "Team" and "VB Code" / "Yearly Revenue Target" is the summary block header
    const firstCell = row[teamColIdx];
    const firstCellLower = firstCell ? String(firstCell).trim().toLowerCase() : "";
    const isTeamHeader = firstCellLower === "team";
    const hasSummaryHeaders = rowStrings.includes("vb code") && (rowStrings.includes("yearly revenue target") || rowStrings.includes("yearly placement target") || rowStrings.includes("yearly target"));
    if (isTeamHeader && hasSummaryHeaders) {
      currentSummaryHeaderRow = row;
      continue;
    }

    const isTeamNameRow = firstCellLower && teamNames.has(firstCellLower) && row.length > 2;

    // Handle summary row that starts directly with team name (no "Team" header before it)
    if (isTeamNameRow && !isTeamHeader) {
      report.summaryRowsChecked += 1;
      const sheetTeamName = firstCellLower || (row[teamColIdx] != null ? String(row[teamColIdx]).trim() : null);
      if (expectedTeamName && !isSheetTeamMatchingPanel(sheetTeamName)) {
        report.summaryRowsRejectedWrongTeam += 1;
        continue;
      }
      let summaryData;
      if (currentSummaryHeaderRow && currentSummaryHeaderRow.length) {
        const getValSummary = buildGetValFromHeaderRow(currentSummaryHeaderRow);
        summaryData = extractSummaryFields(row, getValSummary);
        summaryData.leadName = summaryData.leadName || (row[2] != null ? String(row[2]).trim() : null) || summaryData.recruiterName;
      } else {
        summaryData = extractSummaryFromTeamNameRow(row, true);
      }
      const vbCode = summaryData.vbCode;
      const leadName = summaryData.leadName || (row[2] ? String(row[2]).trim() : null);
      if (vbCode || leadName) {
        const leadUser = findLeadCached(vbCode, leadName, sheetTeamName);
        if (leadUser) {
          report.summaryRowsAccepted += 1;
          currentVbCode = vbCode;
          currentLeadName = leadName;
          currentLeadUser = leadUser;
          currentTeamName = sheetTeamName || null;
          currentSummaryRow = summaryData;
          leadSummaryData.set(leadUser.id, summaryData);
          inPersonBlock = true;
          localPlcIds.clear();
        }
      }
      continue;
    }

    if (isTeamHeader) {
      // New person block detected - reset current person tracking
      inPersonBlock = true;
      currentVbCode = null;
      currentLeadName = null;
      currentLeadUser = null;
      currentTeamName = null;
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
        const metricsTeamName = isNextTeamNameRow ? nextFirstCell : (getVal(nextRow, "team") ?? null);
        if (expectedTeamName && !isSheetTeamMatchingPanel(metricsTeamName)) {
          continue; // Skip block for different team
        }
        // Get values - summary row might have team name in first column, then VB Code, then Lead Name
        let metricsVbCode = getVal(nextRow, "vb code");
        let metricsLeadName = getVal(nextRow, "lead name") || getVal(nextRow, "lead");
        
        // If first column is team name, VB Code and Lead Name might be in columns 1 and 2
        if (isNextTeamNameRow && nextRow.length > 2) {
          const summaryData = extractSummaryFromTeamNameRow(nextRow, true);
          metricsVbCode = summaryData.vbCode;
          metricsLeadName = nextRow[2] ? String(nextRow[2]).trim() : null;
          currentSummaryRow = summaryData;
        } else {
          currentSummaryRow = extractSummaryFields(nextRow, getVal);
        }
        
        if (metricsLeadName && !isNextTeamNameRow && teamNames.has(String(metricsLeadName).trim().toLowerCase())) {
          continue;
        }
        
        const hasCandidate = getVal(nextRow, "candidate name");
        if ((metricsVbCode || metricsLeadName) && !hasCandidate) {
          currentVbCode = metricsVbCode;
          currentLeadName = metricsLeadName;
          
          currentLeadUser = findLeadCached(metricsVbCode, metricsLeadName, metricsTeamName);
          if (!currentLeadUser && (metricsVbCode || metricsLeadName)) {
            batchErrors.push({ rowIndex: rowIndex + lookAhead, message: "Lead not found for VB code / lead name" });
            continue;
          }
          
          if (currentLeadUser) {
            currentTeamName = metricsTeamName || null;
            if (currentSummaryRow) leadSummaryData.set(currentLeadUser.id, currentSummaryRow);
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
      const teamNameFromRow = getVal(row, "team") ?? (row[teamColIdx] != null ? String(row[teamColIdx]).trim() : null);
      // Try to identify lead from this summary row (must belong to team when team name is present)
      let lead = currentLeadUser;
      if (!lead && (summaryData.vbCode || leadNameInRow)) {
        lead = findLeadCached(summaryData.vbCode, leadNameInRow, teamNameFromRow);
        if (lead) {
          currentLeadUser = lead;
          currentVbCode = summaryData.vbCode;
          currentLeadName = leadNameInRow;
          currentTeamName = teamNameFromRow || currentTeamName;
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
          currentLeadUser = findLeadCached(currentVbCode, currentLeadName, currentTeamName);
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
    report.placementRowsChecked += 1;
    if (expectedTeamName && currentTeamName && !isSheetTeamMatchingPanel(currentTeamName)) {
      report.placementsRejectedWrongTeam += 1;
      continue;
    }
    let leadUser = currentLeadUser;
    if (!leadUser) {
      const vbCode = getVal(row, "vb code");
      const leadName = getVal(row, "lead name") || getVal(row, "lead");
      const rowTeamName = getVal(row, "team") ?? (row[teamColIdx] != null ? String(row[teamColIdx]).trim() : null);
      const teamNameForLookup = currentTeamName || rowTeamName;
      
      // Skip if lead name is actually a team name (like "Vantedge")
      if (leadName && teamNames.has(String(leadName).trim().toLowerCase())) {
        continue; // Skip this row - it's a team name, not a lead name
      }
      
      leadUser = findLeadCached(vbCode, leadName, teamNameForLookup);
      if (!leadUser && (vbCode || leadName)) {
        leadUser = await findLeadByVbOrName(vbCode, leadName, teamNameForLookup);
      }
      if (!leadUser) {
        if (expectedTeamName && teamNameForLookup && !isSheetTeamMatchingPanel(teamNameForLookup)) {
          report.placementsRejectedWrongTeam += 1;
        } else {
          report.placementsRejectedLeadNotFound += 1;
        }
        continue;
      }
      // Update current tracking and mark as in person block
      inPersonBlock = true;
      currentVbCode = vbCode;
      currentLeadName = leadName;
      currentLeadUser = leadUser;
      if (teamNameForLookup) currentTeamName = teamNameForLookup;
    }

  // PLC ID
    const plcIdRaw = getVal(row, "plc id") || getVal(row, "pls id");
    const plcId = (plcIdRaw === 0 || plcIdRaw === "0") ? "0" : String(plcIdRaw || "").trim();
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

    // Get summary data for this lead (from summary row or current block). Summary-only fields must
    // be taken ONLY from summaryData: after the placement header row, headerMap is the placement
    // header, so getVal(row, "yearly revenue target") would read placementRow[6] = DOJ (Excel date),
    // getVal(row, "slab qualified") would read placementRow[10] = Placement Type (FTE), etc.
    const summaryData = leadSummaryData.get(leadUser.id) || currentSummaryRow || {};

    const finalYearlyPlacementTarget = summaryData.yearlyPlacementTarget ?? null;
    const finalPlacementDone = summaryData.placementDone ?? null;
    const finalPlacementAchPercent = summaryData.placementAchPercent ?? summaryData.targetAchievedPercent ?? null;
    const finalYearlyRevenueTarget = summaryData.yearlyRevenueTarget ?? null;
    const finalRevenueAch = summaryData.revenueAch ?? null;
    const finalRevenueTargetAchievedPercent = summaryData.revenueTargetAchievedPercent ?? null;
    const finalTotalRevenueGenerated = summaryData.totalRevenueGenerated ?? null;
    const finalSlabQualified = summaryData.slabQualified != null && String(summaryData.slabQualified).trim()
      ? String(summaryData.slabQualified).trim()
      : null;
    const finalTotalIncentiveInr = summaryData.totalIncentiveInr ?? null;
    const finalTotalIncentivePaidInr = summaryData.totalIncentivePaidInr ?? null;

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
      placementDone: capPlacementDone(finalPlacementDone),
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

  // Persist summary-only leads: if a lead has summary data but no placement rows, create one row with summary so it's stored
  const leadIdsWithPlacements = new Set(preparedRows.map((r) => r.leadId));
  const SUMMARY_PLC_PREFIX = "SUMMARY-";
  for (const [leadId, summaryData] of leadSummaryData) {
    if (leadIdsWithPlacements.has(leadId)) continue;
    const profile = allProfiles.find((p) => p.id === leadId);
    if (!profile) continue;
    const dojPlaceholder = new Date(Date.UTC(2000, 0, 1));
    preparedRows.push({
      id: undefined,
      leadId,
      level: profile.level || "L2",
      candidateName: "(Summary only)",
      recruiterName: null,
      leadName: summaryData.leadName || summaryData.recruiterName || profile.user?.name || null,
      splitWith: null,
      placementYear: null,
      doj: dojPlaceholder,
      doq: null,
      client: "-",
      plcId: SUMMARY_PLC_PREFIX + leadId,
      placementType: "-",
      billingStatus: "PENDING",
      collectionStatus: null,
      totalBilledHours: null,
      revenueLeadUsd: 0,
      incentiveInr: 0,
      incentivePaidInr: 0,
      vbCode: summaryData.vbCode ?? null,
      yearlyPlacementTarget: summaryData.yearlyPlacementTarget ?? null,
      placementDone: capPlacementDone(summaryData.placementDone ?? null),
      placementAchPercent: summaryData.placementAchPercent ?? summaryData.targetAchievedPercent ?? null,
      yearlyRevenueTarget: summaryData.yearlyRevenueTarget ?? null,
      revenueAch: summaryData.revenueAch ?? null,
      revenueTargetAchievedPercent: summaryData.revenueTargetAchievedPercent ?? null,
      totalRevenueGenerated: summaryData.totalRevenueGenerated ?? null,
      slabQualified: summaryData.slabQualified != null && String(summaryData.slabQualified).trim() ? String(summaryData.slabQualified).trim() : null,
      totalIncentiveInr: summaryData.totalIncentiveInr ?? null,
      totalIncentivePaidInr: summaryData.totalIncentivePaidInr ?? null,
    });
  }

  // Resolve existing summary-only rows so we update instead of duplicate
  const summaryOnlyLeadIds = [...leadSummaryData.keys()].filter((id) => !leadIdsWithPlacements.has(id));
  if (summaryOnlyLeadIds.length > 0) {
    const existingSummaryRows = await prisma.teamPlacement.findMany({
      where: { leadId: { in: summaryOnlyLeadIds }, plcId: { startsWith: SUMMARY_PLC_PREFIX } },
      select: { id: true, leadId: true },
    });
    const existingByLeadId = new Map(existingSummaryRows.map((p) => [p.leadId, p.id]));
    for (const row of preparedRows) {
      if (row.plcId && String(row.plcId).startsWith(SUMMARY_PLC_PREFIX) && existingByLeadId.has(row.leadId)) {
        row.id = existingByLeadId.get(row.leadId);
      }
    }
  }

  if (preparedRows.length === 0 && leadSummaryData.size === 0) {
    console.log("No valid placements or summary data found in sheet.");
    report.placementsCreated = 0;
    report.placementsUpdated = 0;
    return {
      summary: {
        placementsCreated: 0,
        placementsUpdated: 0,
        employeesUpdated: 0,
      },
      batchId: null,
      insertedCount: 0,
      errors: [],
      report,
    };
  }

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
        errors: batchErrors.length ? batchErrors : undefined,
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

    // When this import added real placement rows for a lead, remove their old summary-only placeholder row
    const leadIdsWithRealPlacementsInThisImport = new Set(
      preparedRows.filter((r) => !(r.plcId && String(r.plcId).startsWith(SUMMARY_PLC_PREFIX))).map((r) => r.leadId)
    );
    if (leadIdsWithRealPlacementsInThisImport.size > 0) {
      await tx.teamPlacement.deleteMany({
        where: {
          leadId: { in: [...leadIdsWithRealPlacementsInThisImport] },
          plcId: { startsWith: SUMMARY_PLC_PREFIX },
        },
      });
    }

    // Do NOT update EmployeeProfile from team import. Team summary lives only in TeamPlacement
    // and is read via getTeamPlacementOverview. Updating profile here would overwrite the lead's
    // personal target/summary (e.g. L2's personal 450000) with team-sheet data and jumble team vs personal.

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
        employeesUpdated: 0,
      },
      batchId: batch.id,
      errors: batchErrors,
    };
  }, {
    timeout: 60000,
  });

  report.placementsCreated = result.summary?.placementsCreated ?? 0;
  report.placementsUpdated = result.summary?.placementsUpdated ?? 0;

  return {
    ...result,
    insertedCount: result.summary?.placementsCreated ?? 0,
    errors: result.errors ?? [],
    report,
  };
}

export async function deletePlacement(id, actorId) {
  const [personalDeleted, teamDeleted] = await Promise.all([
    prisma.personalPlacement.deleteMany({ where: { id } }),
    prisma.teamPlacement.deleteMany({ where: { id } }),
  ]);
  const count = personalDeleted.count + teamDeleted.count;
  if (count === 0) {
    const err = new Error("Placement not found");
    err.statusCode = 404;
    throw err;
  }
  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_DELETED",
      entityType: "Placement",
      entityId: id,
    },
  });
  return { id, deleted: true };
}

export async function bulkDeletePlacements(placementIds, actorId) {
  const [personalResult, teamResult] = await Promise.all([
    prisma.personalPlacement.deleteMany({ where: { id: { in: placementIds } } }),
    prisma.teamPlacement.deleteMany({ where: { id: { in: placementIds } } }),
  ]);
  const count = personalResult.count + teamResult.count;
  await prisma.auditLog.create({
    data: {
      actorId,
      action: "PLACEMENT_BULK_DELETED",
      entityType: "Placement",
      changes: { count, ids: placementIds },
    },
  });
  return { count };
}

export async function deleteAllPlacements(actorId) {
  return await prisma.$transaction(async (tx) => {
    const personalCount = await tx.personalPlacement.deleteMany({});
    const teamCount = await tx.teamPlacement.deleteMany({});
    const batchCount = await tx.placementImportBatch.deleteMany({});

    await tx.auditLog.create({
      data: {
        actorId,
        action: "ALL_PLACEMENTS_DELETED",
        entityType: "Placement",
        changes: {
          personal: personalCount.count,
          team: teamCount.count,
          batches: batchCount.count,
        },
      },
    });

    return {
      personal: personalCount.count,
      team: teamCount.count,
      batches: batchCount.count,
    };
  });
}


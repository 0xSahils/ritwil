import express from "express";
import { Role } from "../generated/client/index.js";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { cacheMiddleware } from "../middleware/cache.js";
import {
  getSuperAdminOverview,
  getTeamLeadOverview,
  getPersonalPlacementOverview,
  getTeamPlacementOverview,
} from "../controllers/dashboardController.js";

const router = express.Router();
// const prisma = new PrismaClient();

// Helper to process employee data with year filtering (now includes PersonalPlacement and TeamPlacement)
const processEmployeeData = async (employee, year) => {
  if (!employee || !employee.employeeProfile) return null;

  // Fetch personal and team placements
  // Check for team placements if user is a TEAM_LEAD (any level, not just L2/L3)
  const [personalPlacements, teamPlacements] = await Promise.all([
    prisma.personalPlacement.findMany({
      where: {
        employeeId: employee.id,
        ...(year && year !== 'All' ? { placementYear: Number(year) } : {}),
      },
    }),
    employee.role === Role.TEAM_LEAD
      ? prisma.teamPlacement.findMany({
          where: {
            leadId: employee.id,
            ...(year && year !== 'All' ? { placementYear: Number(year) } : {}),
          },
        })
      : Promise.resolve([]),
  ]);

  // Calculate available years from all data before filtering
  const availableYears = new Set();
  
  if (employee.placements) {
    employee.placements.forEach(p => {
      if (p.doj) {
        const y = new Date(p.doj).getFullYear();
        if (!isNaN(y)) availableYears.add(y);
      }
      if (p.placementYear) {
        availableYears.add(p.placementYear);
      }
    });
  }

  // Add years from personal placements
  personalPlacements.forEach(p => {
    if (p.placementYear) availableYears.add(p.placementYear);
    if (p.doj) {
      const y = new Date(p.doj).getFullYear();
      if (!isNaN(y)) availableYears.add(y);
    }
  });

  // Add years from team placements
  teamPlacements.forEach(p => {
    if (p.placementYear) availableYears.add(p.placementYear);
    if (p.doj) {
      const y = new Date(p.doj).getFullYear();
      if (!isNaN(y)) availableYears.add(y);
    }
  });
  
  if (employee.incentives) {
    employee.incentives.forEach(i => {
      if (i.periodEnd) {
        const y = new Date(i.periodEnd).getFullYear();
        if (!isNaN(y)) availableYears.add(y);
      }
    });
  }
  
  // Ensure current year is always available
  availableYears.add(new Date().getFullYear());
  
  const sortedAvailableYears = Array.from(availableYears).sort((a, b) => b - a);

  let targetYear = null;
  if (year && year !== 'All') {
    targetYear = parseInt(year);
  }

  // Filter old placements by DOJ year or placementYear
  const filteredPlacements = (employee.placements || []).filter(p => {
    if (!targetYear) return true;
    if (p.placementYear) return p.placementYear === targetYear;
    if (p.doj) {
      const pDate = new Date(p.doj);
      return pDate.getFullYear() === targetYear;
    }
    return false;
  });

  // Filter personal placements by year
  const filteredPersonalPlacements = personalPlacements.filter(p => {
    if (!targetYear) return true;
    if (p.placementYear) return p.placementYear === targetYear;
    if (p.doj) {
      const pDate = new Date(p.doj);
      return pDate.getFullYear() === targetYear;
    }
    return false;
  });

  // Filter team placements by year
  const filteredTeamPlacements = teamPlacements.filter(p => {
    if (!targetYear) return true;
    if (p.placementYear) return p.placementYear === targetYear;
    if (p.doj) {
      const pDate = new Date(p.doj);
      return pDate.getFullYear() === targetYear;
    }
    return false;
  });

  // Filter incentives by periodEnd year
  const filteredIncentives = (employee.incentives || []).filter(i => {
    if (!targetYear) return true;
    if (!i.periodEnd) return false;
    const iDate = new Date(i.periodEnd);
    return iDate.getFullYear() === targetYear;
  });

  const yearlyTarget = Number(employee.employeeProfile.yearlyTarget || 0);
  const yearlyRevenueTarget = employee.employeeProfile.yearlyRevenueTarget ? Number(employee.employeeProfile.yearlyRevenueTarget) : null;
  const yearlyPlacementTarget = employee.employeeProfile.yearlyPlacementTarget ? Number(employee.employeeProfile.yearlyPlacementTarget) : null;
  const targetType = employee.employeeProfile.targetType || (employee.employeeProfile.level === "L4" ? "PLACEMENTS" : "REVENUE");
  const slabQualified = employee.employeeProfile.slabQualified || false;
  
  // Calculate revenue from all sources
  const oldPlacementRevenue = filteredPlacements.reduce(
    (sum, p) => sum + Number(p.revenue || 0),
    0
  );
  const personalPlacementRevenue = filteredPersonalPlacements.reduce(
    (sum, p) => sum + Number(p.revenueUsd || 0),
    0
  );
  const teamPlacementRevenue = filteredTeamPlacements.reduce(
    (sum, p) => sum + Number(p.revenueLeadUsd || 0),
    0
  );
  const revenueGenerated = oldPlacementRevenue + personalPlacementRevenue + teamPlacementRevenue;
  
  const placementsCount = filteredPlacements.length + filteredPersonalPlacements.length + filteredTeamPlacements.length;

  let percentage = 0;
  if (targetType === "PLACEMENTS") {
    percentage = yearlyTarget > 0 ? Math.round((placementsCount / yearlyTarget) * 100) : 0;
  } else {
    percentage = yearlyTarget > 0 ? Math.round((revenueGenerated / yearlyTarget) * 100) : 0;
  }

  const latestIncentive =
    filteredIncentives.length > 0
      ? filteredIncentives.reduce((a, b) =>
          a.periodEnd > b.periodEnd ? a : b
        )
      : null;

  const oldPlacementIncentive = filteredPlacements.reduce(
    (sum, p) => sum + Number(p.incentiveAmountInr || 0),
    0
  );
  const personalPlacementIncentive = filteredPersonalPlacements.reduce(
    (sum, p) => sum + Number(p.incentiveInr || 0),
    0
  );
  const teamPlacementIncentive = filteredTeamPlacements.reduce(
    (sum, p) => sum + Number(p.incentiveInr || 0),
    0
  );
  const totalIncentiveInr = oldPlacementIncentive + personalPlacementIncentive + teamPlacementIncentive;

  // Convert personal placements to same format
  const convertedPersonalPlacements = filteredPersonalPlacements.map(p => ({
    id: p.id,
    candidateName: p.candidateName,
    candidateId: null,
    placementYear: p.placementYear,
    plcId: p.plcId,
    sourcer: null,
    accountManager: null,
    teamLead: p.teamLeadName,
    placementSharing: null,
    placementCredit: null,
    totalRevenue: p.totalRevenueGenerated,
    revenueAsLead: null,
    doi: null,
    doj: p.doj,
    doq: p.doq,
    client: p.client,
    placementType: p.placementType, // Keep exact value from sheet
    billedHours: p.totalBilledHours,
    revenue: Number(p.revenueUsd),
    billingStatus: p.billingStatus,
    collectionStatus: p.collectionStatus,
    incentivePayoutEta: null,
    incentiveAmountInr: Number(p.incentiveInr),
    incentivePaidInr: Number(p.incentivePaidInr || 0),
    monthlyBilling: [],
  }));

  // Convert team placements to same format
  const convertedTeamPlacements = filteredTeamPlacements.map(p => ({
    id: p.id,
    candidateName: p.candidateName,
    candidateId: null,
    placementYear: p.placementYear,
    plcId: p.plcId,
    sourcer: null,
    accountManager: null,
    teamLead: p.leadName,
    placementSharing: p.splitWith,
    placementCredit: null,
    totalRevenue: p.totalRevenueGenerated,
    revenueAsLead: Number(p.revenueLeadUsd),
    doi: null,
    doj: p.doj,
    doq: p.doq,
    client: p.client,
    placementType: p.placementType, // Keep exact value from sheet
    billedHours: p.totalBilledHours,
    revenue: Number(p.revenueLeadUsd),
    billingStatus: p.billingStatus,
    collectionStatus: p.collectionStatus,
    incentivePayoutEta: null,
    incentiveAmountInr: Number(p.incentiveInr),
    incentivePaidInr: Number(p.incentivePaidInr || 0),
    monthlyBilling: [],
  }));

  // Combine all placements
  const allPlacements = [
    ...filteredPlacements.map((p) => ({
      id: p.id,
      candidateName: p.candidateName,
      candidateId: p.candidateId,
      placementYear: p.placementYear,
      plcId: p.plcId,
      sourcer: p.sourcer,
      accountManager: p.accountManager,
      teamLead: p.teamLead,
      placementSharing: p.placementSharing,
      placementCredit: p.placementCredit,
      totalRevenue: p.totalRevenue,
      revenueAsLead: p.revenueAsLead,
      doi: p.doi,
      doj: p.doj,
      doq: p.doq,
      client: p.clientName,
      placementType: p.placementType,
      billedHours: p.billedHours,
      revenue: Number(p.revenue),
      billingStatus: p.billingStatus,
      collectionStatus: p.collectionStatus,
      incentivePayoutEta: p.incentivePayoutEta,
      incentiveAmountInr: Number(p.incentiveAmountInr),
      incentivePaidInr: Number(p.incentivePaidInr || 0),
      monthlyBilling: (p.monthlyBillings || []).map((mb) => ({
        id: mb.id,
        month: mb.month,
        hours: mb.hours,
        status: mb.status,
      })),
    })),
    ...convertedPersonalPlacements,
    ...convertedTeamPlacements,
  ].sort((a, b) => {
    // Sort by doj descending, or createdAt if doj not available
    const dateA = a.doj ? new Date(a.doj) : new Date(0);
    const dateB = b.doj ? new Date(b.doj) : new Date(0);
    return dateB - dateA;
  });

  return {
    id: employee.id,
    name: employee.name,
    role: employee.role, // Include role so frontend can check if user is TEAM_LEAD
    team: employee.employeeProfile.team?.name || null,
    teamLead: employee.employeeProfile.manager?.name || null,
    level: employee.employeeProfile.level || "L4",
    vbid: employee.employeeProfile.vbid || null,
    yearlyTarget,
    yearlyRevenueTarget,
    yearlyPlacementTarget,
    targetType,
    slabQualified,
    revenueGenerated,
    placementsCount,
    percentage,
    selectedYear: targetYear,
    availableYears: sortedAvailableYears,
    incentive: {
      slabName: latestIncentive?.slabName || null,
      amountUsd: latestIncentive?.amountUsd ? Number(latestIncentive.amountUsd) : 0,
      amountInr: totalIncentiveInr,
    },
    placements: allPlacements,
  };
};

router.use(authenticate);

// Route for Super Admin Dashboard
router.get(
  "/super-admin",
  requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN),
  async (req, res, next) => {
    try {
      const year = req.query.year || 'All';
      console.log(`[Dashboard Route] /super-admin called by ${req.user.id}, year=${year}`);
      const data = await getSuperAdminOverview(req.user, year);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/team-lead",
  requireRole(Role.TEAM_LEAD),
  cacheMiddleware(60),
  async (req, res, next) => {
    try {
      const { year } = req.query;
      const data = await getTeamLeadOverview(req.user, year);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/employee",
  requireRole(Role.EMPLOYEE),
  // cacheMiddleware(60),
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { year } = req.query;

      const employee = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          employeeProfile: {
            include: {
              team: true,
              manager: true,
            },
          },
          dailyEntries: true,
          placements: {
            include: { monthlyBillings: true },
          },
          incentives: true,
        },
      });

      const processedData = await processEmployeeData(employee, year);
      
      if (!processedData) {
        return res.status(404).json({ error: "Employee not configured" });
      }

      res.json(processedData);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/employee/:id",
  requireRole(Role.SUPER_ADMIN, Role.TEAM_LEAD, Role.EMPLOYEE),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { year } = req.query;

      const viewerId = req.user.id;
      const viewer = await prisma.user.findUnique({
        where: { id: viewerId },
        include: { employeeProfile: true },
      });

      const employee = await prisma.user.findUnique({
        where: { id },
        include: {
          employeeProfile: {
            include: {
              team: true,
              manager: true,
            },
          },
          dailyEntries: true,
          placements: {
            include: { monthlyBillings: true },
          },
          incentives: true,
        },
      });

      if (!employee || !employee.employeeProfile) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const isSelf = id === viewerId;
      const hasFullAccess = viewer.role === Role.SUPER_ADMIN || viewer.role === Role.S1_ADMIN;

      if (!isSelf && !hasFullAccess) {
        if (viewer.role === Role.TEAM_LEAD) {
          if (employee.employeeProfile.managerId !== viewerId) {
            return res.status(403).json({ error: "Forbidden: Not your subordinate" });
          }
        } else {
          // Regular employees cannot view others
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const processedData = await processEmployeeData(employee, year);
      res.json(processedData);
    } catch (err) {
      next(err);
    }
  }
);

// Sheet-backed personal placements overview (for dashboards)
router.get(
  "/personal-placements",
  requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN, Role.TEAM_LEAD, Role.EMPLOYEE),
  async (req, res, next) => {
    try {
      const { userId, year } = req.query;
      const targetUserId = userId || req.user.id;
      const data = await getPersonalPlacementOverview(targetUserId, year || "All");
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

// Sheet-backed team placements overview (for dashboards)
router.get(
  "/team-placements",
  requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN, Role.TEAM_LEAD),
  async (req, res, next) => {
    try {
      const { leadId, year } = req.query;
      const targetLeadId = leadId || req.user.id;
      const data = await getTeamPlacementOverview(targetLeadId, year || "All");
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

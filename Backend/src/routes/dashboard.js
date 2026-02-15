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
  resolveEmployeeId,
} from "../controllers/dashboardController.js";

const router = express.Router();
// const prisma = new PrismaClient();

// Helper to process employee data
const processEmployeeData = async (employee) => {
  if (!employee || !employee.employeeProfile) return null;

  // Fetch personal and team placements
  // Check for team placements if user is a TEAM_LEAD (any level, not just L2/L3)
  const [personalPlacements, teamPlacements] = await Promise.all([
    prisma.personalPlacement.findMany({
      where: {
        employeeId: employee.id,
      },
    }),
    employee.role === Role.TEAM_LEAD
      ? prisma.teamPlacement.findMany({
          where: {
            leadId: employee.id,
          },
        })
      : Promise.resolve([]),
  ]);

  const yearlyTarget = Number(employee.employeeProfile.yearlyTarget || 0);
  const yearlyRevenueTarget = employee.employeeProfile.yearlyRevenueTarget ? Number(employee.employeeProfile.yearlyRevenueTarget) : null;
  const yearlyPlacementTarget = employee.employeeProfile.yearlyPlacementTarget ? Number(employee.employeeProfile.yearlyPlacementTarget) : null;
  const targetType = employee.employeeProfile.targetType || (employee.employeeProfile.level === "L4" ? "PLACEMENTS" : "REVENUE");
  const slabQualified = employee.employeeProfile.slabQualified || false;
  
  // Calculate revenue from all sources
  const oldPlacementRevenue = (employee.placements || []).reduce(
    (sum, p) => sum + Number(p.revenue || 0),
    0
  );
  const personalPlacementRevenue = personalPlacements.reduce(
    (sum, p) => sum + Number(p.revenueUsd || 0),
    0
  );
  const teamPlacementRevenue = teamPlacements.reduce(
    (sum, p) => sum + Number(p.revenueLeadUsd || 0),
    0
  );
  const revenueGenerated = oldPlacementRevenue + personalPlacementRevenue + teamPlacementRevenue;
  
  const placementsCount = (employee.placements || []).length + personalPlacements.length + teamPlacements.length;

  let percentage = 0;
  if (targetType === "PLACEMENTS") {
    percentage = yearlyTarget > 0 ? Math.round((placementsCount / yearlyTarget) * 100) : 0;
  } else {
    percentage = yearlyTarget > 0 ? Math.round((revenueGenerated / yearlyTarget) * 100) : 0;
  }

  const latestIncentive = null;

  const oldPlacementIncentive = (employee.placements || []).reduce(
    (sum, p) => sum + Number(p.incentiveAmountInr || 0),
    0
  );
  const personalPlacementIncentive = personalPlacements.reduce(
    (sum, p) => sum + Number(p.incentiveInr || 0),
    0
  );
  const teamPlacementIncentive = teamPlacements.reduce(
    (sum, p) => sum + Number(p.incentiveInr || 0),
    0
  );
  const totalIncentiveInr = oldPlacementIncentive + personalPlacementIncentive + teamPlacementIncentive;

  // Convert personal placements to same format
  const convertedPersonalPlacements = personalPlacements.map(p => ({
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
  const convertedTeamPlacements = teamPlacements.map(p => ({
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
    ...(employee.placements || []).map((p) => ({
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
      console.log(`[Dashboard Route] /super-admin called by ${req.user.id}`);
      const data = await getSuperAdminOverview(req.user);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/team-lead",
  requireRole(Role.TEAM_LEAD),
  async (req, res, next) => {
    try {
      const data = await getTeamLeadOverview(req.user);
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
        },
      });

      const processedData = await processEmployeeData(employee);
      
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
      const { id: idOrSlug } = req.params;
      const viewerId = req.user.id;

      let employeeId;
      try {
        employeeId = await resolveEmployeeId(idOrSlug);
      } catch (err) {
        if (err.statusCode === 404) {
          return res.status(404).json({ error: "Employee not found" });
        }
        throw err;
      }

      const viewer = await prisma.user.findUnique({
        where: { id: viewerId },
        include: { employeeProfile: true },
      });

      const employee = await prisma.user.findUnique({
        where: { id: employeeId },
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
        },
      });

      if (!employee || !employee.employeeProfile) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const isSelf = employeeId === viewerId;
      const hasFullAccess = viewer.role === Role.SUPER_ADMIN || viewer.role === Role.S1_ADMIN;

      if (!isSelf && !hasFullAccess) {
        if (viewer.role === Role.TEAM_LEAD) {
          if (employee.employeeProfile.managerId !== viewerId) {
            return res.status(403).json({ error: "Forbidden: Not your subordinate" });
          }
        } else {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const processedData = await processEmployeeData(employee);
      res.json(processedData);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

router.get(
  "/personal-placements",
  requireRole(Role.EMPLOYEE, Role.TEAM_LEAD, Role.S1_ADMIN, Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { userId } = req.query;
      const data = await getPersonalPlacementOverview(req.user, userId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/team-placements",
  requireRole(Role.TEAM_LEAD, Role.S1_ADMIN, Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { leadId } = req.query;
      const data = await getTeamPlacementOverview(req.user, leadId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

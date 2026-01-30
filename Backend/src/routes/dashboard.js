import express from "express";
import pkg from "@prisma/client";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { cacheMiddleware } from "../middleware/cache.js";
import { getSuperAdminOverview, getTeamLeadOverview } from "../controllers/dashboardController.js";

const { Role } = pkg;
const router = express.Router();
// const prisma = new PrismaClient();

// Helper to calculate days completed
function calculateDaysCompleted(doj) {
  if (!doj) return 0;
  const start = new Date(doj);
  const now = new Date();
  // If future, return 0
  if (start > now) return 0;
  
  const diffTime = now - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
}

router.use(authenticate);

router.get(
  "/super-admin",
  requireRole(Role.SUPER_ADMIN),
  // cacheMiddleware(60), // Disabled to ensure fresh data
  async (req, res, next) => {
    try {
      const data = await getSuperAdminOverview(req.user);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/team-lead",
  requireRole(Role.TEAM_LEAD),
  cacheMiddleware(60),
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
  cacheMiddleware(60),
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
          incentives: true,
        },
      });

      if (!employee || !employee.employeeProfile) {
        return res.status(404).json({ error: "Employee not configured" });
      }

      const yearlyTarget = Number(employee.employeeProfile.yearlyTarget || 0);
      const yearlyRevenueTarget = employee.employeeProfile.yearlyRevenueTarget ? Number(employee.employeeProfile.yearlyRevenueTarget) : null;
      const yearlyPlacementTarget = employee.employeeProfile.yearlyPlacementTarget ? Number(employee.employeeProfile.yearlyPlacementTarget) : null;
      const targetType = employee.employeeProfile.targetType || "REVENUE";
      const slabQualified = employee.employeeProfile.slabQualified || false;
      
      const revenueGenerated = employee.placements.reduce(
        (sum, p) => sum + Number(p.revenue || 0),
        0
      );
      const placementsCount = employee.placements.length;

      let percentage = 0;
      if (targetType === "PLACEMENTS") {
        percentage = yearlyTarget > 0 ? Math.round((placementsCount / yearlyTarget) * 100) : 0;
      } else {
        percentage = yearlyTarget > 0 ? Math.round((revenueGenerated / yearlyTarget) * 100) : 0;
      }

      const latestIncentive =
        employee.incentives.length > 0
          ? employee.incentives.reduce((a, b) =>
              a.periodEnd > b.periodEnd ? a : b
            )
          : null;

      const totalIncentiveInr = employee.placements.reduce(
        (sum, p) => sum + Number(p.incentiveAmountInr || 0),
        0
      );

      res.json({
        id: employee.id,
        name: employee.name,
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
        placements: employee.placements.map((p) => ({
          id: p.id,
          candidateName: p.candidateName,
          candidateId: p.candidateId,
          clientId: p.clientId,
          jpcId: p.jpcId,
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
          daysCompleted: calculateDaysCompleted(p.doj),
          client: p.clientName,
          placementType: p.placementType,
          billedHours: p.billedHours,
          marginPercent: Number(p.marginPercent),
          revenue: Number(p.revenue),
          billingStatus: p.billingStatus,
          incentivePayoutEta: p.incentivePayoutEta,
          incentiveAmountInr: Number(p.incentiveAmountInr),
          incentivePaid: p.incentivePaid,
          qualifier: p.qualifier,
          monthlyBilling: p.monthlyBillings.map((mb) => ({
            id: mb.id,
            month: mb.month,
            hours: mb.hours,
            status: mb.status,
          })),
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/employee/:id",
  requireRole(Role.SUPER_ADMIN, Role.TEAM_LEAD),
  async (req, res, next) => {
    try {
      const { id } = req.params;

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

      if (
        viewer.role === Role.TEAM_LEAD &&
        employee.employeeProfile.managerId !== viewerId
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const yearlyTarget = Number(employee.employeeProfile.yearlyTarget || 0);
      const yearlyRevenueTarget = employee.employeeProfile.yearlyRevenueTarget ? Number(employee.employeeProfile.yearlyRevenueTarget) : null;
      const yearlyPlacementTarget = employee.employeeProfile.yearlyPlacementTarget ? Number(employee.employeeProfile.yearlyPlacementTarget) : null;
      const targetType = employee.employeeProfile.targetType || "REVENUE";
      
      const revenueGenerated = employee.placements.reduce(
        (sum, p) => sum + Number(p.revenue || 0),
        0
      );
      const placementsCount = employee.placements.length;

      let percentage = 0;
      if (targetType === "PLACEMENTS") {
        percentage = yearlyTarget > 0 ? Math.round((placementsCount / yearlyTarget) * 100) : 0;
      } else {
        percentage = yearlyTarget > 0 ? Math.round((revenueGenerated / yearlyTarget) * 100) : 0;
      }

      const latestIncentive =
        employee.incentives.length > 0
          ? employee.incentives.reduce((a, b) =>
              a.periodEnd > b.periodEnd ? a : b
            )
          : null;

      const totalIncentiveInr = employee.placements.reduce(
        (sum, p) => sum + Number(p.incentiveAmountInr || 0),
        0
      );

      res.json({
        id: employee.id,
        name: employee.name,
        team: employee.employeeProfile.team?.name || null,
        teamLead: employee.employeeProfile.manager?.name || null,
        level: employee.employeeProfile.level || "L4",
        vbid: employee.employeeProfile.vbid || null,
        yearlyTarget,
        yearlyRevenueTarget,
        yearlyPlacementTarget,
        targetType,
        slabQualified: employee.employeeProfile.slabQualified,
        revenueGenerated,
        placementsCount,
        percentage,
        incentive: {
          slabName: latestIncentive?.slabName || null,
          amountUsd: latestIncentive?.amountUsd ? Number(latestIncentive.amountUsd) : 0,
          amountInr: totalIncentiveInr,
        },
        placements: employee.placements.map((p) => ({
          id: p.id,
          candidateName: p.candidateName,
          candidateId: p.candidateId,
          clientId: p.clientId,
          jpcId: p.jpcId,
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
          daysCompleted: calculateDaysCompleted(p.doj),
          client: p.clientName,
          placementType: p.placementType,
          billedHours: p.billedHours,
          marginPercent: Number(p.marginPercent),
          revenue: Number(p.revenue),
          billingStatus: p.billingStatus,
          incentivePayoutEta: p.incentivePayoutEta,
          incentiveAmountInr: Number(p.incentiveAmountInr),
          incentivePaid: p.incentivePaid,
          qualifier: p.qualifier,
          monthlyBilling: p.monthlyBillings.map((mb) => ({
            id: mb.id,
            month: mb.month,
            hours: mb.hours,
            status: mb.status,
          })),
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

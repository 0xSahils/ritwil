import express from "express";
import pkg from "@prisma/client";
import { authenticate, requireRole } from "../middleware/auth.js";
import { cacheMiddleware } from "../middleware/cache.js";
import { getSuperAdminOverview } from "../controllers/dashboardController.js";

const { PrismaClient, Role } = pkg;
const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate);

router.get(
  "/super-admin",
  requireRole(Role.SUPER_ADMIN),
  cacheMiddleware(60),
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
      const userId = req.user.id;

      const leadProfile = await prisma.employeeProfile.findUnique({
        where: { id: userId },
        include: { team: true, user: true },
      });

      if (!leadProfile || !leadProfile.team) {
        return res.status(404).json({ error: "Team lead not configured" });
      }

      const team = await prisma.team.findUnique({
        where: { id: leadProfile.teamId },
        include: {
          employees: {
            where: { isActive: true },
            include: { user: true },
          },
        },
      });

      const employees = await prisma.user.findMany({
        where: {
          role: Role.EMPLOYEE,
          isActive: true,
          employeeProfile: { managerId: userId },
        },
        include: {
          employeeProfile: true,
          dailyEntries: true,
        },
      });

      const members = employees.map((emp) => {
        const target = Number(emp.employeeProfile?.yearlyTarget || 0);
        const revenue = emp.dailyEntries.reduce(
          (sum, e) => sum + Number(e.revenue),
          0
        );
        const pct =
          target > 0 ? Math.round((revenue / target) * 100) : 0;

        return {
          id: emp.id,
          name: emp.name,
          level: emp.employeeProfile?.level || "L4",
          target,
          targetAchieved: pct,
          revenue,
        };
      });

      const leadTarget = Number(leadProfile.yearlyTarget || 0);
      const leadRevenue = members.reduce((sum, m) => sum + m.revenue, 0);
      const leadPct =
        leadTarget > 0 ? Math.round((leadRevenue / leadTarget) * 100) : 0;

      res.json({
        team: {
          id: team.id,
          name: team.name,
          color: team.color || "blue",
          teamTarget: team.employees.reduce(
            (sum, p) => sum + Number(p.yearlyTarget || 0),
            0
          ),
        },
        lead: {
          id: leadProfile.id,
          name: leadProfile.user.name,
          level: leadProfile.level || "L2",
          target: leadTarget,
          targetAchieved: leadPct,
        },
        members,
      });
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
      const revenueGenerated = employee.placements.reduce(
        (sum, p) => sum + Number(p.revenue || 0),
        0
      );
      const percentage =
        yearlyTarget > 0
          ? Math.round((revenueGenerated / yearlyTarget) * 100)
          : 0;

      const latestIncentive =
        employee.incentives.length > 0
          ? employee.incentives.reduce((a, b) =>
              a.periodEnd > b.periodEnd ? a : b
            )
          : null;

      res.json({
        id: employee.id,
        name: employee.name,
        team: employee.employeeProfile.team?.name || null,
        teamLead: employee.employeeProfile.manager?.name || null,
        level: employee.employeeProfile.level || "L4",
        yearlyTarget,
        revenueGenerated,
        percentage,
        incentive: latestIncentive
          ? {
              slabName: latestIncentive.slabName,
              amountUsd: Number(latestIncentive.amountUsd),
              amountInr: Number(latestIncentive.amountInr),
            }
          : null,
        placements: employee.placements.map((p) => ({
          id: p.id,
          candidateName: p.candidateName,
          candidateId: p.candidateId,
          jpcId: p.jpcId,
          doi: p.doi,
          doj: p.doj,
          daysCompleted: p.daysCompleted,
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
      const revenueGenerated = employee.placements.reduce(
        (sum, p) => sum + Number(p.revenue || 0),
        0
      );
      const percentage =
        yearlyTarget > 0
          ? Math.round((revenueGenerated / yearlyTarget) * 100)
          : 0;

      const latestIncentive =
        employee.incentives.length > 0
          ? employee.incentives.reduce((a, b) =>
              a.periodEnd > b.periodEnd ? a : b
            )
          : null;

      res.json({
        id: employee.id,
        name: employee.name,
        team: employee.employeeProfile.team?.name || null,
        teamLead: employee.employeeProfile.manager?.name || null,
        level: employee.employeeProfile.level || "L4",
        yearlyTarget,
        revenueGenerated,
        percentage,
        incentive: latestIncentive
          ? {
              slabName: latestIncentive.slabName,
              amountUsd: Number(latestIncentive.amountUsd),
              amountInr: Number(latestIncentive.amountInr),
            }
          : null,
        placements: employee.placements.map((p) => ({
          id: p.id,
          candidateName: p.candidateName,
          candidateId: p.candidateId,
          jpcId: p.jpcId,
          doi: p.doi,
          doj: p.doj,
          daysCompleted: p.daysCompleted,
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

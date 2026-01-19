import express from "express";
import pkg from "@prisma/client";
import { authenticate, requireRole } from "../middleware/auth.js";

const { PrismaClient, Role, CampaignStatus } = pkg;
const router = express.Router();
const prisma = new PrismaClient();

async function recordActivity(campaignId, userId, action, metadata) {
  await prisma.campaignActivity.create({
    data: {
      campaignId,
      userId,
      action,
      metadata: metadata ? metadata : undefined,
    },
  });
}

router.use(authenticate);

router.get(
  "/",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const campaigns = await prisma.campaign.findMany({
        include: {
          teamLeads: {
            include: { user: true },
          },
          assignments: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const mapped = campaigns.map((c) => {
        const totalTarget = c.assignments.reduce(
          (sum, a) => sum + Number(a.targetAmount),
          0
        );
        const weightedProgress =
          totalTarget > 0
            ? Math.round(
                c.assignments.reduce(
                  (sum, a) =>
                    sum + (Number(a.targetAmount) * a.progressPercent) / 100,
                  0
                ) / totalTarget *
                  100
              )
            : 0;

        return {
          id: c.id,
          name: c.name,
          description: c.description,
          objective: c.objective,
          status: c.status,
          targetAmount: Number(c.targetAmount),
          startDate: c.startDate,
          endDate: c.endDate,
          totalTarget,
          progressPercent: weightedProgress,
          teamLeads: c.teamLeads.map((tl) => ({
            id: tl.user.id,
            name: tl.user.name,
          })),
          assignmentsCount: c.assignments.length,
          completedAssignmentsCount: c.assignments.filter(
            (a) => a.isCompleted
          ).length,
        };
      });

      res.json(mapped);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/my",
  requireRole(Role.TEAM_LEAD, Role.EMPLOYEE),
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      const assignments = await prisma.campaignAssignment.findMany({
        where: { userId },
        include: {
          campaign: {
            include: {
              teamLeads: {
                include: { user: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const campaignsMap = new Map();

      assignments.forEach((a) => {
        const c = a.campaign;
        if (!campaignsMap.has(c.id)) {
          campaignsMap.set(c.id, {
            id: c.id,
            name: c.name,
            description: c.description,
            objective: c.objective,
            status: c.status,
            targetAmount: Number(c.targetAmount),
            startDate: c.startDate,
            endDate: c.endDate,
            teamLeads: c.teamLeads.map((tl) => ({
              id: tl.user.id,
              name: tl.user.name,
            })),
            myAssignments: [],
          });
        }
        campaignsMap.get(c.id).myAssignments.push({
          id: a.id,
          role: a.role,
          targetAmount: Number(a.targetAmount),
          progressPercent: a.progressPercent,
          isCompleted: a.isCompleted,
        });
      });

      res.json(Array.from(campaignsMap.values()));
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const {
        name,
        description,
        objective,
        targetAmount,
        startDate,
        endDate,
      } = req.body;

      if (!name || !targetAmount || !startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "Missing required fields" });
      }

      const campaign = await prisma.campaign.create({
        data: {
          name,
          description: description || null,
          objective: objective || null,
          status: CampaignStatus.DRAFT,
          targetAmount,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          createdById: req.user.id,
        },
      });

      await recordActivity(campaign.id, req.user.id, "CAMPAIGN_CREATED", {
        name,
      });

      res.status(201).json({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        objective: campaign.objective,
        status: campaign.status,
        targetAmount: Number(campaign.targetAmount),
        startDate: campaign.startDate,
        endDate: campaign.endDate,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:id",
  requireRole(Role.SUPER_ADMIN, Role.TEAM_LEAD, Role.EMPLOYEE),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
          teamLeads: {
            include: { user: true },
          },
          assignments: {
            include: { user: true },
          },
          images: true,
        },
      });

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      if (role !== Role.SUPER_ADMIN) {
        const isLead = await prisma.campaignTeamLead.findFirst({
          where: { campaignId: id, userId },
        });
        const isAssignee = await prisma.campaignAssignment.findFirst({
          where: { campaignId: id, userId },
        });
        if (!isLead && !isAssignee) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const totalTarget = campaign.assignments.reduce(
        (sum, a) => sum + Number(a.targetAmount),
        0
      );
      const weightedProgress =
        totalTarget > 0
          ? Math.round(
              campaign.assignments.reduce(
                (sum, a) =>
                  sum +
                  (Number(a.targetAmount) * a.progressPercent) / 100,
                0
              ) / totalTarget *
                100
            )
          : 0;

      res.json({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        objective: campaign.objective,
        status: campaign.status,
        targetAmount: Number(campaign.targetAmount),
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        totalTarget,
        progressPercent: weightedProgress,
        teamLeads: campaign.teamLeads.map((tl) => ({
          id: tl.user.id,
          name: tl.user.name,
        })),
        assignments: campaign.assignments.map((a) => ({
          id: a.id,
          userId: a.userId,
          name: a.user.name,
          role: a.role,
          targetAmount: Number(a.targetAmount),
          progressPercent: a.progressPercent,
          isCompleted: a.isCompleted,
        })),
        images: campaign.images.map((img) => ({
          id: img.id,
          url: img.url,
          title: img.title,
          description: img.description,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        objective,
        status,
        targetAmount,
        startDate,
        endDate,
      } = req.body;

      const data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (objective !== undefined) data.objective = objective;
      if (status !== undefined) data.status = status;
      if (targetAmount !== undefined) data.targetAmount = targetAmount;
      if (startDate !== undefined)
        data.startDate = new Date(startDate);
      if (endDate !== undefined) data.endDate = new Date(endDate);

      const updated = await prisma.campaign.update({
        where: { id },
        data,
      });

      await recordActivity(id, req.user.id, "CAMPAIGN_UPDATED", data);

      res.json({
        id: updated.id,
        name: updated.name,
        description: updated.description,
        objective: updated.objective,
        status: updated.status,
        targetAmount: Number(updated.targetAmount),
        startDate: updated.startDate,
        endDate: updated.endDate,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/:id/team-leads",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user || user.role !== Role.TEAM_LEAD) {
        return res
          .status(400)
          .json({ error: "User must be a team lead" });
      }

      const link = await prisma.campaignTeamLead.create({
        data: {
          campaignId: id,
          userId,
        },
        include: { user: true },
      });

      await recordActivity(
        id,
        req.user.id,
        "CAMPAIGN_TEAM_LEAD_ADDED",
        { userId }
      );

      res.status(201).json({
        id: link.id,
        userId: link.userId,
        name: link.user.name,
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Team lead already assigned" });
      }
      next(err);
    }
  }
);

router.post(
  "/:id/assignments",
  requireRole(Role.SUPER_ADMIN, Role.TEAM_LEAD),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userId, role, targetAmount } = req.body;

      if (!userId || !role || !targetAmount) {
        return res
          .status(400)
          .json({ error: "Missing required fields" });
      }

      if (![Role.TEAM_LEAD, Role.EMPLOYEE].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const assignment = await prisma.campaignAssignment.create({
        data: {
          campaignId: id,
          userId,
          role,
          targetAmount,
        },
        include: { user: true },
      });

      await recordActivity(
        id,
        req.user.id,
        "CAMPAIGN_ASSIGNMENT_CREATED",
        { userId, role, targetAmount }
      );

      res.status(201).json({
        id: assignment.id,
        userId: assignment.userId,
        name: assignment.user.name,
        role: assignment.role,
        targetAmount: Number(assignment.targetAmount),
        progressPercent: assignment.progressPercent,
        isCompleted: assignment.isCompleted,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/assignments/:assignmentId",
  requireRole(Role.SUPER_ADMIN, Role.TEAM_LEAD, Role.EMPLOYEE),
  async (req, res, next) => {
    try {
      const { assignmentId } = req.params;
      const { progressPercent, isCompleted } = req.body;
      const userId = req.user.id;
      const role = req.user.role;

      const assignment = await prisma.campaignAssignment.findUnique({
        where: { id: assignmentId },
      });

      if (!assignment) {
        return res
          .status(404)
          .json({ error: "Assignment not found" });
      }

      if (
        role === Role.EMPLOYEE &&
        assignment.userId !== userId
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const data = {};
      if (progressPercent !== undefined) {
        data.progressPercent = Math.max(
          0,
          Math.min(100, progressPercent)
        );
      }
      if (isCompleted !== undefined) {
        data.isCompleted = isCompleted;
        data.completedAt = isCompleted ? new Date() : null;
      }

      const updated = await prisma.campaignAssignment.update({
        where: { id: assignmentId },
        data,
        include: { campaign: true, user: true },
      });

      await recordActivity(
        updated.campaignId,
        userId,
        "CAMPAIGN_ASSIGNMENT_UPDATED",
        data
      );

      res.json({
        id: updated.id,
        userId: updated.userId,
        name: updated.user.name,
        role: updated.role,
        targetAmount: Number(updated.targetAmount),
        progressPercent: updated.progressPercent,
        isCompleted: updated.isCompleted,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/:id/images",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { url, title, description } = req.body;

      if (!url) {
        return res
          .status(400)
          .json({ error: "Image url is required" });
      }

      const image = await prisma.campaignImage.create({
        data: {
          campaignId: id,
          url,
          title: title || null,
          description: description || null,
          uploadedById: req.user.id,
        },
      });

      await recordActivity(
        id,
        req.user.id,
        "CAMPAIGN_IMAGE_ADDED",
        { url }
      );

      res.status(201).json({
        id: image.id,
        url: image.url,
        title: image.title,
        description: image.description,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:id/images",
  requireRole(Role.SUPER_ADMIN, Role.TEAM_LEAD, Role.EMPLOYEE),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const role = req.user.role;

      if (role !== Role.SUPER_ADMIN) {
        const isLead = await prisma.campaignTeamLead.findFirst({
          where: { campaignId: id, userId },
        });
        const isAssignee = await prisma.campaignAssignment.findFirst({
          where: { campaignId: id, userId },
        });
        if (!isLead && !isAssignee) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }

      const images = await prisma.campaignImage.findMany({
        where: { campaignId: id },
        orderBy: { createdAt: "desc" },
      });

      res.json(
        images.map((img) => ({
          id: img.id,
          url: img.url,
          title: img.title,
          description: img.description,
        }))
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:id/activities",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const activities = await prisma.campaignActivity.findMany({
        where: { campaignId: id },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      });

      res.json(
        activities.map((a) => ({
          id: a.id,
          action: a.action,
          userId: a.userId,
          userName: a.user.name,
          metadata: a.metadata,
          createdAt: a.createdAt,
        }))
      );
    } catch (err) {
      next(err);
    }
  }
);

export default router;

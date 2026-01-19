import express from "express";
import pkg from "@prisma/client";
import { authenticate, requireRole } from "../middleware/auth.js";
import { cacheMiddleware } from "../middleware/cache.js";
import {
  listTeamsWithMembers,
  createTeam,
  deleteTeam,
  bulkAssignEmployeesToTeam,
  assignTeamLead,
  getTeamDetails,
  removeMemberFromTeam,
  updateMemberTarget,
} from "../controllers/teamController.js";

const { Role } = pkg;
const router = express.Router();

router.use(authenticate);

router.get("/", requireRole(Role.SUPER_ADMIN), cacheMiddleware(60), async (req, res, next) => {
  try {
    const data = await listTeamsWithMembers();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireRole(Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getTeamDetails(id);
    res.json(data);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

router.post("/", requireRole(Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const team = await createTeam(req.body, req.user.id);
    res.status(201).json(team);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

router.delete("/:id", requireRole(Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteTeam(id, req.user.id);
    res.status(204).send();
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    next(err);
  }
});

router.post(
  "/:id/assign-members",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userIds } = req.body;
      await bulkAssignEmployeesToTeam(id, userIds || [], req.user.id);
      res.status(204).send();
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

router.post(
  "/:id/assign-lead",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const updated = await assignTeamLead(id, userId, req.user.id);
      res.json({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
      });
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

router.delete(
  "/:id/members/:userId",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { id, userId } = req.params;
      await removeMemberFromTeam(id, userId, req.user.id);
      res.status(204).send();
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

router.patch(
  "/:id/members/:userId/target",
  requireRole(Role.SUPER_ADMIN),
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { target } = req.body;
      const updated = await updateMemberTarget(userId, target, req.user.id);
      res.json(updated);
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      next(err);
    }
  }
);

export default router;


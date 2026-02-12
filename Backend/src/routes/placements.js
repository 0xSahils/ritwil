import express from "express";
import { Role } from "../generated/client/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { clearCacheMiddleware } from "../middleware/cache.js";
import {
  getPlacementsByUser,
  createPlacement,
  updatePlacement,
  updatePlacementBilling,
  bulkCreatePlacements,
  bulkCreateGlobalPlacements,
  deletePlacement,
  bulkDeletePlacements,
  bulkUpdateMetrics,
} from "../controllers/placementController.js";
import {
  importPersonalPlacements,
  importTeamPlacements,
  deleteAllPlacements,
} from "../controllers/placementController.js";

const router = express.Router();

router.use(authenticate);
router.use(clearCacheMiddleware);

// Bulk update metrics
router.post("/bulk-metrics", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const { metrics } = req.body;
    if (!Array.isArray(metrics)) {
      return res.status(400).json({ error: "metrics must be an array" });
    }
    const result = await bulkUpdateMetrics(metrics, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Import Members Placement (Personal data)
router.post(
  "/import/personal",
  requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN),
  async (req, res, next) => {
    try {
      const { headers, rows } = req.body;
      const result = await importPersonalPlacements({ headers, rows }, req.user.id);
      res.status(201).json(result);
    } catch (err) {
      const message = err.message || "Failed to import personal placements";
      res.status(400).json({ error: message });
    }
  }
);

// Import Team Lead Placement (Team data)
router.post(
  "/import/team",
  requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN),
  async (req, res, next) => {
    try {
      const { headers, rows } = req.body;
      const result = await importTeamPlacements({ headers, rows }, req.user.id);
      res.status(201).json(result);
    } catch (err) {
      const message = err.message || "Failed to import team placements";
      res.status(400).json({ error: message });
    }
  }
);

// Bulk delete placements
router.delete("/bulk", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const { placementIds } = req.body;
    if (!Array.isArray(placementIds)) {
      return res.status(400).json({ error: "placementIds must be an array" });
    }
    const result = await bulkDeletePlacements(placementIds, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Delete ALL placement data (Personal, Team, and old model)
router.delete("/all", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const result = await deleteAllPlacements(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get placements for a specific user
router.get("/user/:userId", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await getPlacementsByUser(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Create a single placement
router.post("/user/:userId", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const placement = await createPlacement(userId, req.body, req.user.id);
    res.status(201).json(placement);
  } catch (err) {
    next(err);
  }
});

// Bulk create placements (single user)
router.post("/user/:userId/bulk", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { placements } = req.body; // Expecting { placements: [...] }
    if (!Array.isArray(placements)) {
      return res.status(400).json({ error: "placements must be an array" });
    }
    const created = await bulkCreatePlacements(userId, placements, req.user.id);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Bulk create placements (global / multi-user)
router.post("/bulk-global", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const { placements, campaignId } = req.body; // Expecting { placements: [{ employeeId, ... }], campaignId: optional }
    if (!Array.isArray(placements)) {
      return res.status(400).json({ error: "placements must be an array" });
    }
    const result = await bulkCreateGlobalPlacements(placements, req.user.id, campaignId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// Update a placement
router.put("/:id", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    const placement = await updatePlacement(id, req.body, req.user.id);
    res.json(placement);
  } catch (err) {
    next(err);
  }
});

// Update placement billing (monthly)
router.put("/:id/billing", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { month, billingData } = req.body;
    const result = await updatePlacementBilling(id, month, billingData, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

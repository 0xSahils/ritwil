import express from "express";
import pkg from "@prisma/client";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  getPlacementsByUser,
  createPlacement,
  updatePlacement,
  updatePlacementBilling,
  bulkCreatePlacements,
  bulkCreateGlobalPlacements,
  deletePlacement,
  bulkDeletePlacements,
} from "../controllers/placementController.js";

const { Role } = pkg;
const router = express.Router();

router.use(authenticate);

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
router.post("/user/:userId", requireRole(Role.SUPER_ADMIN), async (req, res, next) => {
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
router.put("/:id", requireRole(Role.SUPER_ADMIN), async (req, res, next) => {
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
    const { billing } = req.body; // Expecting { billing: [{ month, hours, status }] }
    const result = await updatePlacementBilling(id, billing, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Delete a placement
router.delete("/:id", requireRole(Role.SUPER_ADMIN, Role.S1_ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    await deletePlacement(id, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

import express from "express";
import pkg from "@prisma/client";
import { authenticate, requireRole } from "../middleware/auth.js";
import { getAuditLogs } from "../controllers/auditLogController.js";

const { Role } = pkg;
const router = express.Router();

router.use(authenticate);

router.get("/", requireRole(Role.S1_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 50);
    const { entityType, actorId } = req.query;
    
    const result = await getAuditLogs({ page, pageSize, entityType, actorId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

import express from "express";
import { Role } from "../generated/client/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { getAuditLogs, exportAuditLogs } from "../controllers/auditLogController.js";
import * as XLSX from "xlsx";

const router = express.Router();

router.use(authenticate);

router.get("/", requireRole(Role.S1_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 50);
    const { entityType, actorId, module, action, startDate, endDate, status, ipAddress } = req.query;
    
    const result = await getAuditLogs({ page, pageSize, entityType, actorId, module, action, startDate, endDate, status, ipAddress });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/export", requireRole(Role.S1_ADMIN, Role.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { entityType, actorId, module, action, startDate, endDate, status, format = 'json' } = req.query;
    const logs = await exportAuditLogs({ entityType, actorId, module, action, startDate, endDate, status, format });

    if (format === 'csv') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(logs);
      XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      return res.send(buffer);
    } else if (format === 'xlsx') {
       const wb = XLSX.utils.book_new();
       const ws = XLSX.utils.json_to_sheet(logs);
       XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
       const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
       res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.xlsx');
       return res.send(buffer);
    }
    
    // Default JSON
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;

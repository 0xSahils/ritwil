import express from "express";
import pkg from "@prisma/client";
import prisma from "../prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const { Role, PlacementType, BillingStatus } = pkg;
const router = express.Router();
// const prisma = new PrismaClient();

router.use(authenticate);

router.get("/me", requireRole(Role.EMPLOYEE), async (req, res, next) => {
  try {
    const entries = await prisma.dailyEntry.findMany({
      where: { employeeId: req.user.id },
      orderBy: { date: "desc" },
      take: 100,
    });

    res.json(
      entries.map((e) => ({
        id: e.id,
        date: e.date,
        clientName: e.clientName,
        placementType: e.placementType,
        revenue: Number(e.revenue),
        marginPercent: Number(e.marginPercent),
        billingStatus: e.billingStatus,
        doi: e.doi,
        doj: e.doj,
        remarks: e.remarks,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRole(Role.EMPLOYEE), async (req, res, next) => {
  try {
    const {
      date,
      clientName,
      placementType,
      revenue,
      marginPercent,
      billingStatus,
      doi,
      doj,
      remarks,
    } = req.body;

    if (!date || !clientName || !placementType || !revenue || !marginPercent) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!Object.values(PlacementType).includes(placementType)) {
      return res.status(400).json({ error: "Invalid placement type" });
    }

    if (!Object.values(BillingStatus).includes(billingStatus)) {
      return res.status(400).json({ error: "Invalid billing status" });
    }

    const entry = await prisma.dailyEntry.create({
      data: {
        employeeId: req.user.id,
        date: new Date(date),
        clientName,
        placementType,
        revenue,
        marginPercent,
        billingStatus,
        doi: doi ? new Date(doi) : new Date(date),
        doj: doj ? new Date(doj) : new Date(date),
        remarks: remarks || null,
      },
    });

    res.status(201).json({
      id: entry.id,
      date: entry.date,
      clientName: entry.clientName,
      placementType: entry.placementType,
      revenue: Number(entry.revenue),
      marginPercent: Number(entry.marginPercent),
      billingStatus: entry.billingStatus,
      doi: entry.doi,
      doj: entry.doj,
      remarks: entry.remarks,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

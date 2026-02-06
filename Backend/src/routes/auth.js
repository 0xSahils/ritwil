import express from "express";
import bcrypt from "bcryptjs";
import pkg from "@prisma/client";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import prisma from "../prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { authenticate } from "../middleware/auth.js";
import { createAuditLog } from "../controllers/auditLogController.js";

const { PrismaClient } = pkg;
const router = express.Router();
// const prisma = new PrismaClient();

async function createRefreshToken(userId) {
  const tokenRecord = await prisma.refreshToken.create({
    data: {
      userId,
      token: "",
      expiresAt: new Date(
        Date.now() +
          (parseInt(process.env.JWT_REFRESH_TTL_DAYS || "30", 10) ||
            30) *
            24 *
            60 *
            60 *
            1000
      ),
    },
  });

  const token = signRefreshToken({ id: userId }, tokenRecord.id);

  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { token },
  });

  return token;
}

router.post("/login", async (req, res, next) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        employeeProfile: {
          include: {
            team: true,
            manager: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      await createAuditLog({
        actorId: null,
        action: "LOGIN_ATTEMPT",
        module: "AUTH",
        entityType: "User",
        entityId: email,
        status: "FAILURE",
        ipAddress,
        userAgent,
        changes: { reason: "User not found or inactive", email }
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      await createAuditLog({
        actorId: user.id,
        action: "LOGIN_ATTEMPT",
        module: "AUTH",
        entityType: "User",
        entityId: user.id,
        status: "FAILURE",
        ipAddress,
        userAgent,
        changes: { reason: "Invalid password" }
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // MFA Check
    if (user.mfaEnabled) {
      const { mfaCode } = req.body;
      if (!mfaCode) {
        return res.status(403).json({ mfaRequired: true, userId: user.id });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token: mfaCode,
      });

      if (!verified) {
        await createAuditLog({
          actorId: user.id,
          action: "LOGIN_ATTEMPT",
          module: "AUTH",
          entityType: "User",
          entityId: user.id,
          status: "FAILURE",
          ipAddress,
          userAgent,
          changes: { reason: "Invalid MFA code" }
        });
        return res.status(401).json({ error: "Invalid MFA code" });
      }
    }

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    const profile = user.employeeProfile;

    await createAuditLog({
      actorId: user.id,
      action: "LOGIN_ATTEMPT",
      module: "AUTH",
      entityType: "User",
      entityId: user.id,
      status: "SUCCESS",
      ipAddress,
      userAgent,
      changes: { email: user.email }
    });

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
        maxAge:
          (parseInt(process.env.JWT_REFRESH_TTL_DAYS || "30", 10) || 30) *
          24 *
          60 *
          60 *
          1000,
      })
      .json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          team: profile?.team
            ? {
                id: profile.team.id,
                name: profile.team.name,
                color: profile.team.color,
              }
            : null,
          manager: profile?.manager
            ? {
                id: profile.manager.id,
                name: profile.manager.name,
                email: profile.manager.email,
              }
            : null,
          level: profile?.level,
          yearlyTarget: profile?.yearlyTarget,
        },
      });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });
  res.json({ message: "Logged out" });
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }

    if (!payload || !payload.jti) {
      return res.status(401).json({ error: "Invalid refresh token payload" });
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });

    if (!tokenRecord || tokenRecord.token !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Check if revoked? (Optional, if we had revokedAt)
    
    const user = await prisma.user.findUnique({
        where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
        return res.status(401).json({ error: "User inactive or not found" });
    }

    const accessToken = signAccessToken(user);
    // Optionally rotate refresh token here
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

// Generate MFA Secret
router.post("/mfa/setup", authenticate, async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `Ritwil (${req.user.email})`,
    });

    // Save temporary secret? Or just return it and save only when verified?
    // Better: Save it but don't enable it yet.
    await prisma.user.update({
      where: { id: req.user.id },
      data: { mfaSecret: secret.base32 },
    });

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return next(err);
      res.json({ secret: secret.base32, qrCode: data_url });
    });
  } catch (err) {
    next(err);
  }
});

// Verify and Enable MFA
router.post("/mfa/verify", authenticate, async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user.mfaSecret) {
      return res.status(400).json({ error: "MFA setup not initiated" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token,
    });

    if (verified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { mfaEnabled: true },
      });
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid token" });
    }
  } catch (err) {
    next(err);
  }
});

// Disable MFA
router.post("/mfa/disable", authenticate, async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    // Require password to disable
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid password" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: false, mfaSecret: null },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

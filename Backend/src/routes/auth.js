import crypto from "crypto";
import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
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
import { sendPasswordResetEmail } from "../utils/email.js";

const router = express.Router();

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

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res, next) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation failed", details: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }

    const { email, password } = req.body;
    const emailLower = typeof email === "string" ? email.toLowerCase() : email;

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
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

      // Validate MFA secret exists
      if (!user.mfaSecret) {
        await createAuditLog({
          actorId: user.id,
          action: "LOGIN_ATTEMPT",
          module: "AUTH",
          entityType: "User",
          entityId: user.id,
          status: "FAILURE",
          ipAddress,
          userAgent,
          changes: { reason: "MFA enabled but secret not found" }
        });
        return res.status(500).json({ error: "MFA configuration error. Please contact support." });
      }

      // Normalize the code: remove spaces, ensure it's exactly 6 digits
      const normalizedCode = String(mfaCode).replace(/\s/g, '').trim();
      
      if (!/^\d{6}$/.test(normalizedCode)) {
        await createAuditLog({
          actorId: user.id,
          action: "LOGIN_ATTEMPT",
          module: "AUTH",
          entityType: "User",
          entityId: user.id,
          status: "FAILURE",
          ipAddress,
          userAgent,
          changes: { reason: "Invalid MFA code format" }
        });
        return res.status(401).json({ error: "MFA code must be exactly 6 digits" });
      }

      // Normalize and validate secret
      const normalizedSecret = user.mfaSecret.trim().toUpperCase();
      
      // Verify TOTP with increased window and explicit time
      const verified = speakeasy.totp.verify({
        secret: normalizedSecret,
        encoding: "base32",
        token: normalizedCode,
        window: 4, // Increased window: allow codes from 4 time steps before and after (2 minutes total window)
        time: Math.floor(Date.now() / 1000), // Explicitly set current time in seconds
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
        return res.status(401).json({ 
          error: "Invalid MFA code. Please ensure you're using the code from your authenticator app and that your device's clock is synchronized. If you recently disabled and re-enabled MFA, you may need to scan the QR code again." 
        });
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
          mfaEnabled: user.mfaEnabled,
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

router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  };
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      if (payload?.jti) {
        await prisma.refreshToken.updateMany({
          where: { id: payload.jti },
          data: { isRevoked: true },
        });
      }
    } catch {
      // Token invalid or expired; still clear cookie
    }
  }
  res.clearCookie("refreshToken", cookieOptions);
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

    if (tokenRecord.isRevoked) {
      return res.status(401).json({ error: "Session expired. Please login again." });
    }
    
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

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Forgot password: create token, optionally send email
router.post(
  "/forgot-password",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
      }
      const email = (req.body.email || "").toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email, isActive: true },
      });
      // Always return same message to avoid leaking whether email exists
      const message =
        "You will receive reset instructions shortly on your Email ID.";
      if (!user) {
        return res.json({ message });
      }
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });
      const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
      const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;
      const emailSent = await sendPasswordResetEmail(user.email, resetLink);
      if (process.env.NODE_ENV !== "production" && !emailSent.sent) {
        return res.json({ message, resetLink });
      }
      res.json({ message });
    } catch (err) {
      next(err);
    }
  }
);

// Reset password: validate token, update password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
      }
      const { token, password } = req.body;
      const tokenHash = hashToken(token);
      const record = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });
      if (
        !record ||
        record.usedAt ||
        new Date() > record.expiresAt
      ) {
        return res.status(400).json({
          error: "Invalid or expired reset link. Please request a new one.",
        });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.$transaction([
        prisma.user.update({
          where: { id: record.userId },
          data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        }),
      ]);
      res.json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
      next(err);
    }
  }
);

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

    // Normalize the token: remove spaces, ensure it's exactly 6 digits
    const normalizedToken = String(token).replace(/\s/g, '').trim();
    
    if (!/^\d{6}$/.test(normalizedToken)) {
      return res.status(400).json({ error: "MFA code must be exactly 6 digits" });
    }

    // Normalize and validate secret
    const normalizedSecret = user.mfaSecret.trim().toUpperCase();

    const verified = speakeasy.totp.verify({
      secret: normalizedSecret,
      encoding: "base32",
      token: normalizedToken,
      window: 4, // Increased window: allow codes from 4 time steps before and after (2 minutes total window)
      time: Math.floor(Date.now() / 1000), // Explicitly set current time in seconds
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

import express from "express";
import bcrypt from "bcryptjs";
import pkg from "@prisma/client";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const { PrismaClient } = pkg;
const router = express.Router();
const prisma = new PrismaClient();

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
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    const profile = user.employeeProfile;

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
              }
            : null,
          level: profile?.level || null,
        },
      });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const token =
      req.cookies.refreshToken || req.body.refreshToken || req.query.token;

    if (!token) {
      return res.status(401).json({ error: "Missing refresh token" });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.isRevoked || stored.userId !== payload.sub) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      return res.status(401).json({ error: "Refresh token expired" });
    }

    const user = stored.user;
    if (!user.isActive) {
      return res.status(403).json({ error: "User deactivated" });
    }

    const accessToken = signAccessToken(user);

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const token =
      req.cookies.refreshToken || req.body.refreshToken || req.query.token;

    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    }

    res
      .clearCookie("refreshToken", {
        path: "/api/auth",
      })
      .json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;

import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

if (process.env.NODE_ENV === 'production') {
    if (accessSecret === "dev-access-secret" || refreshSecret === "dev-refresh-secret") {
        console.warn("⚠️  WARNING: You are using default JWT secrets in production! Please set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env file.");
    }
}

const accessTokenTtl = process.env.JWT_ACCESS_TTL || "24h";
const refreshTokenTtl = process.env.JWT_REFRESH_TTL || "30d";

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    accessSecret,
    { expiresIn: accessTokenTtl }
  );
}

export function signRefreshToken(user, jti) {
  return jwt.sign(
    {
      sub: user.id,
      jti,
    },
    refreshSecret,
    { expiresIn: refreshTokenTtl }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret);
}


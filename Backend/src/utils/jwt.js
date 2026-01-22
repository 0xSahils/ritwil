import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

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


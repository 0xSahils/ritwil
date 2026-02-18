import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "./prisma.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/users.js";
import dashboardRouter from "./routes/dashboard.js";
import teamRouter from "./routes/teams.js";
import placementRouter from "./routes/placements.js";
import auditLogRouter from "./routes/auditLogs.js";
import { clearCacheMiddleware } from "./middleware/cache.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// const prisma = new PrismaClient();

// Security Middleware: Helmet + in production HSTS and a balanced CSP (tuned to this codebase)
const isProduction = process.env.NODE_ENV === "production";
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'", "blob:"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            fontSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            frameAncestors: ["'self'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
          },
        }
      : true,
    ...(isProduction && {
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    }),
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const PORT = process.env.PORT || 4000;
// CORS: single origin or comma-separated list (e.g. "https://app.com,https://www.app.com")
const rawOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const corsOrigin = rawOrigin.includes(",")
  ? rawOrigin.split(",").map((o) => o.trim()).filter(Boolean)
  : rawOrigin.trim();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Serve static files from React build in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../Frontend/dist");
  app.use(express.static(distPath));
  console.log(`Serving static files from: ${distPath}`);
}

app.use(clearCacheMiddleware);

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/teams", teamRouter);
app.use("/api/placements", placementRouter);
app.use("/api/audit-logs", auditLogRouter);

// Catch-all handler: send back React's index.html file in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../Frontend/dist/index.html"));
  });
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
// Trigger restart for prisma update 2

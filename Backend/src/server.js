import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "@prisma/client";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/users.js";
import dashboardRouter from "./routes/dashboard.js";
import dailyEntryRouter from "./routes/dailyEntries.js";
import campaignRouter from "./routes/campaigns.js";
import teamRouter from "./routes/teams.js";
import placementRouter from "./routes/placements.js";
import { clearCacheMiddleware } from "./middleware/cache.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { PrismaClient } = pkg;
const app = express();
const prisma = new PrismaClient();

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
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
app.use("/api/daily-entries", dailyEntryRouter);
app.use("/api/campaigns", campaignRouter);
app.use("/api/teams", teamRouter);
app.use("/api/placements", placementRouter);

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
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

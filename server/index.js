import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { startSapSyncJob } from "./jobs/startSapSyncJob.js";
import { attachAuthContext } from "./middleware/authMiddleware.js";
import { auditRequests } from "./middleware/auditMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import poRoutes from "./routes/poRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(
  cors({
    origin: env.frontendOrigin || true,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(attachAuthContext);
app.use(auditRequests());
app.use("/api/auth", authRoutes);
app.use("/api", poRoutes);
app.use("/api/security", securityRoutes);

app.use((error, _request, response, _next) => {
  console.error("[server]", error);
  response.status(500).json({ error: "Unexpected server error." });
});

async function startServer() {
  await connectDatabase();
  startSapSyncJob();

  app.listen(env.port, () => {
    console.log(`[server] Backend listening on http://localhost:${env.port}`);
  });
}

startServer();

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db/db.js";
import authRouter from "./routes/auth.routes.js";
import usersRouter from "./routes/users.routes.js";
import documentRouter from "./routes/documents.routes.js";
import requestsRouter from "./routes/requests.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";
import paymentsRouter from "./routes/payments.routes.js";
import coursesRouter from "./routes/courses.routes.js";
import collegesRouter from "./routes/colleges.routes.js";
import appointmentsRouter from "./routes/appointments.routes.js";
import announcementsRouter from "./routes/announcements.routes.js";
import requestAttachmentsRouter from "./routes/requestAttachments.routes.js";
import logsRouter from "./routes/logs.routes.js";
import officesRouter from "./routes/offices.routes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool: pool as any,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "arch-dev-session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => res.send("hello"));
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/colleges", collegesRouter);
app.use("/api/documents", documentRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/request-attachments", requestAttachmentsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/offices", officesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler - guarantees JSON responses and prevents stack trace leakage
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(`[Unhandled Error] ${req.method} ${req.url}:`, err);
    const isProd = process.env.NODE_ENV === "production";
    return res.status(500).json({
      error: "Internal server error",
      ...(!isProd && err instanceof Error ? { details: err.message } : {}),
    });
  },
);

app.listen(PORT, () => console.log(`Server on ${PORT}`));

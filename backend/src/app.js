import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { mailer } from "./utils/mailer.js";
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import courseRoutes from "./modules/course/course.routes.js";

dotenv.config();

const app = express();

// CORS configuration - allow frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

/**
 * Verify SMTP connection at startup (optional)
 */
(async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await mailer.verify();
      console.log("✅ SMTP server is ready to send emails");
    } catch (err) {
      console.warn("⚠️ SMTP connection failed:", err.message);
      console.warn("⚠️ Email functionality will be limited. Set SMTP_* environment variables to enable.");
    }
  } else {
    console.warn("⚠️ SMTP not configured. Email functionality disabled.");
    console.warn("⚠️ Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables to enable.");
  }
})();

/**
 * Health check route
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * API routes
 */
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use("/courses", courseRoutes);

/**
 * Global error handler (optional but recommended)
 */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;

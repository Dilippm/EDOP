import { Router } from "express";
import { checkDatabaseConnection } from "../config/database.js";
import authRoutes from "./authRoutes.js";
import projectRoutes from "./projectRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();


router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/users", userRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "edop-api",
  });
});

router.get("/health/db", async (req, res) => {
  try {
    const result = await checkDatabaseConnection();

    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: result.current_time,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});
export default router;

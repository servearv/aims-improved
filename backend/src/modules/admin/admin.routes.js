import { Router } from "express";
import { createUser } from "./admin.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireAnyRole } from "../../middlewares/rbac.middleware.js";
import { Roles } from "../../config/roles.js";

const router = Router();

/**
 * POST /admin/users
 * Create new user (ADMIN only)
 */
router.post(
  "/users",
  authMiddleware,
  requireAnyRole([Roles.ADMIN]),
  createUser
);

export default router;


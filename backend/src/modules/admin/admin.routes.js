import { Router } from "express";
import { createUser, listUsers, updateUser, deleteUser, createSession, setCurrentSession } from "./admin.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireAnyRole } from "../../middlewares/rbac.middleware.js";
import { Roles } from "../../config/roles.js";

const router = Router();

/**
 * GET /admin/users
 * List all users (ADMIN only)
 */
router.get(
  "/users",
  authMiddleware,
  requireAnyRole([Roles.ADMIN]),
  listUsers
);

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

/**
 * PUT /admin/users/:id
 * Update user (ADMIN only)
 */
router.put(
  "/users/:id",
  authMiddleware,
  requireAnyRole([Roles.ADMIN]),
  updateUser
);

/**
 * DELETE /admin/users/:id
 * Delete user (ADMIN only)
 */
router.delete(
  "/users/:id",
  authMiddleware,
  requireAnyRole([Roles.ADMIN]),
  deleteUser
);

/**
 * POST /admin/sessions
 * Create new academic session (ADMIN only)
 */
router.post(
  "/sessions",
  authMiddleware,
  requireAnyRole([Roles.ADMIN]),
  createSession
);

/**
 * PUT /admin/sessions/:id/current
 * Set active academic session (ADMIN only)
 */
router.put(
  "/sessions/:id/current",
  authMiddleware,
  requireAnyRole([Roles.ADMIN]),
  setCurrentSession
);

export default router;


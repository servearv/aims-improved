import { createUserService, listUsersService, updateUserService, deleteUserService, createSessionService, setCurrentSessionService } from "./admin.service.js";

export async function createUser(req, res) {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: "email and role required" });
    }

    const user = await createUserService({ email, role });

    return res.status(201).json(user);
  } catch (err) {
    console.error("Create user failed:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function listUsers(req, res) {
  try {
    const { role, search } = req.query;
    const users = await listUsersService({ role, search });
    res.json({ users });
  } catch (err) {
    console.error("List users failed:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await updateUserService(id, updates);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Update user failed:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    const user = await deleteUserService(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user failed:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function createSession(req, res) {
  try {
    const sessionData = req.body;
    const session = await createSessionService(sessionData);
    res.status(201).json(session);
  } catch (err) {
    console.error("Create session failed:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function setCurrentSession(req, res) {
  try {
    const { id } = req.params;
    const session = await setCurrentSessionService(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  } catch (err) {
    console.error("Set current session failed:", err);
    res.status(500).json({ error: err.message });
  }
}



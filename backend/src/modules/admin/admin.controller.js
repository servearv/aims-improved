import { createUserService } from "./admin.service.js";

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

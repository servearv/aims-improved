import { createUser, findUserByEmail, listUsers, deactivateUser } from "../../models/user.model.js";

export async function createUserService({ email, role }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("User already exists");
  }

  const user = await createUser({ email, role });
  return user;
}

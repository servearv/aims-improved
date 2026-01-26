import { createUser, findUserByEmail, listUsers, updateUser, deleteUser } from "../../models/user.model.js";
import { createSession, setCurrentSession } from "../../models/academicSession.model.js";

export async function createUserService({ email, role }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("User already exists");
  }

  const user = await createUser({ email, role });
  return user;
}

export async function listUsersService(filters) {
  return await listUsers(filters);
}

export async function updateUserService(id, updates) {
  return await updateUser(id, updates);
}

export async function deleteUserService(id) {
  return await deleteUser(id);
}

export async function createSessionService(sessionData) {
  return await createSession(sessionData);
}

export async function setCurrentSessionService(sessionId) {
  return await setCurrentSession(sessionId);
}


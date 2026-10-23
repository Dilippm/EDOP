import bcrypt from "bcrypt";
import { createUser, deleteUser, listUsers, updateUser } from "../models/userModel.js";

const VALID_ROLES = new Set(["admin", "developer"]);

function validateUser(body, { creating = false } = {}) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!name || name.length > 150 || !email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid name and email address." };
  }
  if (!VALID_ROLES.has(role)) return { error: "Choose a valid user role." };
  if ((creating || password) && password.length < 8) return { error: "Password must be at least 8 characters." };
  return { name, email, role, password };
}

function isUniqueViolation(error) {
  return error?.code === "23505";
}

export async function getUsers(_req, res) {
  try {
    return res.json({ users: await listUsers() });
  } catch (error) {
    console.error("Unable to list users:", error);
    return res.status(500).json({ message: "Unable to load users." });
  }
}

export async function addUser(req, res) {
  const values = validateUser(req.body ?? {}, { creating: true });
  if (values.error) return res.status(400).json({ message: values.error });
  try {
    values.password = await bcrypt.hash(values.password, 12);
    return res.status(201).json({ user: await createUser(values) });
  } catch (error) {
    if (isUniqueViolation(error)) return res.status(409).json({ message: "A user with this email already exists." });
    console.error("Unable to create user:", error);
    return res.status(500).json({ message: "Unable to create user." });
  }
}

export async function editUser(req, res) {
  const values = validateUser(req.body ?? {});
  if (values.error) return res.status(400).json({ message: values.error });
  try {
    values.password = values.password ? await bcrypt.hash(values.password, 12) : null;
    const user = await updateUser(req.params.id, values);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ user });
  } catch (error) {
    if (isUniqueViolation(error)) return res.status(409).json({ message: "A user with this email already exists." });
    console.error("Unable to update user:", error);
    return res.status(500).json({ message: "Unable to update user." });
  }
}

export async function removeUser(req, res) {
  if (req.params.id === req.auth.sub) return res.status(400).json({ message: "You cannot delete your own account." });
  try {
    const deleted = await deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found." });
    return res.status(204).end();
  } catch (error) {
    console.error("Unable to delete user:", error);
    return res.status(500).json({ message: "Unable to delete user." });
  }
}

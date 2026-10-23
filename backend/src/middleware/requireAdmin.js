import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import pool from "../config/database.js";

export async function requireAdmin(req, res, next) {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication is required." });
  }
  try {
    const claims = jwt.verify(token, env.jwtSecret, {
      issuer: "edop-api",
      audience: "edop",
    });
    const result = await pool.query("SELECT role FROM auth.users WHERE id = $1", [claims.sub]);
    if (!result.rows[0]) {
      return res.status(401).json({ message: "Your account is no longer available." });
    }
    if (result.rows[0].role !== "admin") {
      return res.status(403).json({ message: "Administrator access is required." });
    }
    req.auth = claims;
    return next();
  } catch (error) {
    if (error?.name !== "JsonWebTokenError" && error?.name !== "TokenExpiredError" && error?.name !== "NotBeforeError") {
      console.error("Unable to verify administrator access:", error);
      return res.status(500).json({ message: "Unable to verify administrator access." });
    }
    return res.status(401).json({ message: "Your session is invalid or expired. Please sign in again." });
  }
}

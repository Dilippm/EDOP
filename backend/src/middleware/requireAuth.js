import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import pool from "../config/database.js";

export function createRequireAuth({
  verifyToken = jwt.verify,
  findUserById = (id) => pool.query("SELECT id FROM auth.users WHERE id = $1", [id]),
} = {}) {
  return async function requireAuth(req, res, next) {
    const authorization = req.get("authorization") || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentication is required." });
    }

    try {
      const claims = verifyToken(token, env.jwtSecret, {
        issuer: "edop-api",
        audience: "edop",
      });
      const result = await findUserById(claims.sub);

      if (!result.rows[0]) {
        return res.status(401).json({ message: "Your account is no longer available." });
      }

      req.auth = claims;
      return next();
    } catch (error) {
      if (
        error?.name !== "JsonWebTokenError" &&
        error?.name !== "TokenExpiredError" &&
        error?.name !== "NotBeforeError"
      ) {
        console.error("Unable to verify authentication:", error);
        return res.status(500).json({ message: "Unable to verify authentication." });
      }

      return res.status(401).json({
        message: "Your session is invalid or expired. Please sign in again.",
      });
    }
  };
}

export const requireAuth = createRequireAuth();

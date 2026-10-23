
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findUserByEmail } from "../models/userModel.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await findUserByEmail(email.trim());

    if (
      !user ||
      !user.password_hash ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        role: user.role,
      },
      env.jwtSecret,
      {
        subject: user.id,
        expiresIn: "1d",
        issuer: "edop-api",
        audience: "edop",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: 86400, // 1 day in seconds
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      message: "Unable to process login",
    });
  }
}

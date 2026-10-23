
import bcrypt from "bcrypt";
import { randomBytes, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { findOrCreateOAuthUser, findUserByEmail } from "../models/userModel.js";
const googleClient = new OAuth2Client();

function createSession(user) {
  const accessToken = jwt.sign(
    { role: user.role },
    env.jwtSecret,
    { subject: user.id, expiresIn: "1d", issuer: "edop-api", audience: "edop" }
  );
  return {
    accessToken,
    tokenType: "Bearer",
    expiresIn: 86400,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

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

    return res.status(200).json({
      message: "Login successful",
      ...createSession(user),
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      message: "Unable to process login",
    });
  }
}

export async function googleLogin(req, res) {

  if (!env.googleClientId) {
    return res.status(503).json({
      message: "Google sign-in is not configured.",
    });
  }

  const { credential } = req.body ?? {};

  if (typeof credential !== "string" || !credential) {
    return res.status(400).json({
      message: "Google credential is required.",
    });
  }

  let claims;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });

    claims = ticket.getPayload();
  } catch (error) {
    console.error("[Google Auth] Verification failed:", error.message);

    return res.status(401).json({
      message: "Google credential is invalid or expired.",
    });
  }

  if (!claims?.sub || !claims.email || claims.email_verified !== true) {
    return res.status(401).json({
      message: "Google did not provide a verified account.",
    });
  }

  try {
    const user = await findOrCreateOAuthUser({
      provider: "google",
      providerId: claims.sub,
      name: claims.name || claims.email,
      email: claims.email,
      avatarUrl: claims.picture || null,
    });

    return res.status(200).json({
      message: "Google sign-in successful",
      ...createSession(user),
    });
  } catch (error) {
    console.error("[Google Auth] User processing failed:", error);

    if (error.code === "OAUTH_USER_NOT_REGISTERED") {
      return res.status(403).json({ message: error.message });
    }

    if (error.code === "GOOGLE_IDENTITY_CONFLICT") {
      return res.status(409).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Unable to process Google sign-in.",
    });
  }
}


const githubStates = new Map();
const githubLoginTickets = new Map();

function getCookie(req, name) {
  const prefix = `${name}=`;
  const cookie = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function githubCookieOptions() {
  return [
    "HttpOnly",
    "SameSite=Lax",
    "Path=/api/auth/github",
    "Max-Age=600",
    ...(env.nodeEnv === "production" ? ["Secure"] : []),
  ].join("; ");
}

function redirectToLogin(res, message) {
  const url = new URL("/login", env.frontendUrl);
  url.searchParams.set("github_error", message);
  return res.redirect(url.toString());
}

async function readGithubJson(response, step) {
  const body = await response.text();
  if (!body.trim()) {
    const error = new Error(`${step} returned an empty response (HTTP ${response.status}).`);
    error.code = "GITHUB_EMPTY_RESPONSE";
    throw error;
  }
  try {
    return JSON.parse(body);
  } catch {
    const error = new Error(`${step} returned invalid JSON (HTTP ${response.status}).`);
    error.code = "GITHUB_INVALID_RESPONSE";
    throw error;
  }
}

// GET /api/auth/github
export async function githubLoginStart(req, res) {
  if (!env.githubClientId || !env.githubClientSecret || !env.githubCallbackUrl) {
    return res.status(503).json({
      message: "GitHub sign-in is not configured.",
    });
  }

  const state = randomBytes(32).toString("hex");

  // Prune expired states and one-time tickets.
  const now = Date.now();

  for (const [key, value] of githubStates) {
    if (value.expiresAt < now) githubStates.delete(key);
  }

  for (const [key, value] of githubLoginTickets) {
    if (value.expiresAt < now) githubLoginTickets.delete(key);
  }

  githubStates.set(state, { expiresAt: now + 10 * 60 * 1000 });

  res.setHeader(
    "Set-Cookie",
    `edop_github_state=${encodeURIComponent(state)}; ${githubCookieOptions()}`
  );

  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", env.githubClientId);
  authorizationUrl.searchParams.set("redirect_uri", env.githubCallbackUrl);
  authorizationUrl.searchParams.set("scope", "read:user user:email");
  authorizationUrl.searchParams.set("state", state);

  return res.redirect(authorizationUrl.toString());
}

// GET /api/auth/github/callback
export async function githubLoginCallback(req, res) {
  const { code, state, error } = req.query;

  res.setHeader(
    "Set-Cookie",
    `edop_github_state=; ${githubCookieOptions()}; Max-Age=0`
  );

  if (error) {
    return redirectToLogin(res, "GitHub authorization was cancelled.");
  }

  if (!env.githubClientId || !env.githubClientSecret || !env.githubCallbackUrl) {
    return redirectToLogin(res, "GitHub sign-in is not configured on the backend.");
  }

  if (typeof code !== "string" || typeof state !== "string") {
    return redirectToLogin(res, "Invalid GitHub authorization response.");
  }

  const cookieState = getCookie(req, "edop_github_state");
  const storedState = githubStates.get(state);

  githubStates.delete(state);

  if (
    !cookieState ||
    !safeEqual(cookieState, state) ||
    !storedState ||
    storedState.expiresAt < Date.now()
  ) {
    return redirectToLogin(
      res,
      "GitHub sign-in expired. Please try again."
    );
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: env.githubClientId,
          client_secret: env.githubClientSecret,
          code,
          redirect_uri: env.githubCallbackUrl,
        }).toString(),
        signal: AbortSignal.timeout(10000),
      }
    );

    const tokenData = await readGithubJson(tokenResponse, "GitHub token exchange");

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("GitHub token exchange failed:", tokenData.error);
      return redirectToLogin(res, "Unable to authenticate with GitHub.");
    }

    const githubHeaders = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "EDOP",
    };

    const profileResponse = await fetch("https://api.github.com/user", {
      headers: githubHeaders,
      signal: AbortSignal.timeout(10000),
    });

    if (!profileResponse.ok) {
      return redirectToLogin(res, "Unable to retrieve your GitHub profile.");
    }

    const profile = await readGithubJson(profileResponse, "GitHub profile request");

    if (!profile.id) {
      return redirectToLogin(res, "GitHub returned an invalid profile.");
    }

    // Always ask GitHub for verified emails; the profile email may be private.
    const emailsResponse = await fetch(
      "https://api.github.com/user/emails",
      {
        headers: githubHeaders,
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!emailsResponse.ok) {
      return redirectToLogin(
        res,
        "Unable to verify your GitHub email. Check your GitHub email settings."
      );
    }

    const emails = await readGithubJson(emailsResponse, "GitHub email request");
    const verifiedEmail = emails.find(
      (item) => item.primary === true && item.verified === true
    );

    if (!verifiedEmail?.email) {
      return redirectToLogin(
        res,
        "A verified primary GitHub email is required. Please contact your administrator if you need access."
      );
    }

    const user = await findOrCreateOAuthUser({
      provider: "github",
      providerId: String(profile.id),
      name: profile.name || profile.login || verifiedEmail.email,
      email: verifiedEmail.email,
      avatarUrl: profile.avatar_url || null,
    });

    // Create a short-lived, single-use handoff ticket.
    // The frontend exchanges this ticket for the normal EDOP JWT.
    const ticket = randomBytes(32).toString("hex");

    githubLoginTickets.set(ticket, {
      session: createSession(user),
      expiresAt: Date.now() + 60 * 1000,
    });

    const redirectUrl = new URL("/login", env.frontendUrl);
    redirectUrl.searchParams.set("github_ticket", ticket);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("GitHub sign-in failed:", error.code || "UNKNOWN", error.message);

    if (["GITHUB_EMPTY_RESPONSE", "GITHUB_INVALID_RESPONSE"].includes(error.code)) {
      return redirectToLogin(
        res,
        "GitHub returned an unexpected response. Check the backend log and verify the GitHub OAuth callback URL and app credentials."
      );
    }

    if (error.code === "OAUTH_USER_NOT_REGISTERED") {
      return redirectToLogin(
        res,
        "Your EDOP account is not registered. Please contact your administrator."
      );
    }

    return redirectToLogin(res, "Unable to complete GitHub sign-in.");
  }
}

// POST /api/auth/github/exchange
export async function githubLoginExchange(req, res) {
  const { ticket } = req.body ?? {};

  if (typeof ticket !== "string" || !/^[a-f0-9]{64}$/.test(ticket)) {
    return res.status(400).json({
      message: "A valid GitHub login ticket is required.",
    });
  }

  const entry = githubLoginTickets.get(ticket);

  // Delete before returning so the ticket cannot be reused.
  githubLoginTickets.delete(ticket);

  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(401).json({
      message: "GitHub login ticket expired. Please sign in again.",
    });
  }

  return res.status(200).json({
    message: "GitHub sign-in successful",
    ...entry.session,
  });
}

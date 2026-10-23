import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import routes from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true, methods: ["GET", "POST", "OPTIONS"] }));
app.use(express.json({ limit: "16kb" }));
app.use("/api", routes);

app.use((error, req, res, next) => {
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON request body" });
  }
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body is too large" });
  }
  console.error("Unhandled request error:", error?.message ?? "unknown error");
  return res.status(500).json({ error: "Internal server error" });
});

export default app;

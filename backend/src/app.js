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



export default app;

import Fastify from "fastify";
// Create a Fastify instance
export const app = Fastify({
  logger: true,
});
// Health check route
app.get("/api/v1/health", async () => {
  return {
    status: "ok",
    service: "edop-backend",
  };
});
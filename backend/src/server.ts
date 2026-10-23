import { app } from "./app.js";
import { env } from "./config/env.js";
import { bootstrapAdmin } from "./modules/users/bootstrap-admin.js";

// Start the server
const start = async (): Promise<void> => {
  try {
    await bootstrapAdmin();
    const port = env.PORT;
    const host = env.HOST;

    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    await app.close();
    await import("./config/database.js").then(({ prisma }) =>
      prisma.$disconnect()
    );
    process.exit(1);
  }
};
// Start the server
void start();
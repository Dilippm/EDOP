import argon2 from "argon2";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";

export async function bootstrapAdmin(): Promise<void> {
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
    select: {
      id: true,
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists. Skipping bootstrap.");
    return;
  }

  const email = env.ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD are required to create the initial admin.",
    );
  }


  const passwordHash = await argon2.hash(password);

  await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash,
      emailVerifiedAt: new Date(),
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Initial admin created successfully.");
}
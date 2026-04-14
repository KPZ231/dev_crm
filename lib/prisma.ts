import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const basePrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Extend with Accelerate
export const prisma = basePrisma.$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;


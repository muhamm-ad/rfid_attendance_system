// lib/db.ts

import { PrismaClient } from "@/prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  }).$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;

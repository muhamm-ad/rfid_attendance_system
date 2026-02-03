// @/lib/index.ts

// SERVER-ONLY barrel.
// Do not import from "@/lib" inside Client Components.
import "server-only";

export { handlers, auth, signIn, signOut } from "./auth";
export { prisma } from "./db";
export * from "./auth-utils";
export * from "./utils";

// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  providers: [], // Providers will be added in auth.ts
} satisfies NextAuthConfig;

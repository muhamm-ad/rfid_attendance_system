// lib/auth.ts

import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { getUserByEmail, verifyPassword, hasRequiredRole } from "@/data/user";
import { loginSchema } from "@/schemas";

export const authConfig = {
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const validatedCredentials = loginSchema.safeParse(credentials);
        if (!validatedCredentials.success) {
          return null;
        }

        const { email, password, role } = validatedCredentials.data;
        const user = await getUserByEmail(email);
        if (!user) {
          return null;
        }

        const isPasswordValid = await verifyPassword(user, password);
        if (!isPasswordValid) {
          return null;
        }

        const hasRequiredRoleResult = await hasRequiredRole(user, role);
        if (!hasRequiredRoleResult) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name:
            `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
    // authorized({ auth, request: { nextUrl } }) {
    //   const isLoggedIn = !!auth?.user;
    //   const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
    //   if (isOnDashboard) {
    //     if (isLoggedIn) return true;
    //     return false; // Redirect unauthenticated users to login page
    //   } else if (isLoggedIn) {
    //     return Response.redirect(new URL("/dashboard", nextUrl));
    //   }
    //   return true;
    // },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

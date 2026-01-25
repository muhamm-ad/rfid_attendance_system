// app/api/auth/[...nextauth]/route.ts



// import NextAuth from "next-auth";
// import { authOptions } from "@/lib/auth-config";

// // NextAuth v5 beta returns an object with handlers
// const { handlers } = NextAuth(authOptions);

// // Export the handlers directly
// export const { GET, POST } = handlers;

import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default NextAuth({
  adapter: PrismaAdapter(prisma),
});
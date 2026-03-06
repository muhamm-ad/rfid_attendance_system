// @/types/next-auth.d.ts

import { UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

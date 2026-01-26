// src/app/login/page.tsx

import { Login } from "@/components/login";
import { UserRole } from "@/prisma/generated/client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: UserRole }>;
}) {
  const params = await searchParams;
  const isAdmin = params.role === "admin";
  return (
    <Login
      isAdmin={isAdmin}
      className="relative flex h-auto min-h-screen items-center justify-center px-8 py-12 overflow-hidden"
    />
  );
}

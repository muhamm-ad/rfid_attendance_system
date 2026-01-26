// src/app/login/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center px-8 py-12 overflow-hidden">
    <Button
      onClick={handleLogout}
      className="bg-red-500 text-white hover:bg-red-600"
    >
      <LogOutIcon className="size-4" /> Logout
    </Button>
    </div>
  );
}
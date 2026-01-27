// src/app/(auth)/logout/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";

export default function LogoutPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    startTransition(async () => {
      try {
        const result = await signOut({ redirect: false });

        // Check if sign-out was successful
        if (result?.url || result === undefined) {
          // Sign-out successful, redirect to login
          router.push("/login");
          router.refresh();
        } else {
          // Handle error case
          console.error("Logout error:", result);
          // Still redirect to login even if there's an error
          router.push("/login");
        }
      } catch (error) {
        console.error("Logout error:", error);
        // Still redirect to login on error
        router.push("/login");
      }
    });
  };

  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center px-8 py-12 overflow-hidden">
    <Button
      onClick={handleLogout}
      disabled={isPending}
      className="bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500"
    >
      <LogOutIcon className="size-4" /> {isPending ? "Logging out..." : "Logout"}
    </Button>
    </div>
  );
}
// @/components/logout.tsx

"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useNavigation } from "@/components/providers/navigation-provider";

export default function Logout({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isSigningOut, startSignOut] = useTransition();
  const router = useRouter();
  const { setNavigatingAway } = useNavigation();
  const handleLogout = () => {
    setNavigatingAway(true);
    startSignOut(async () => {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Logout"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      confirmText="Logout"
      destructive
      handleConfirm={handleLogout}
      className="sm:max-w-sm"
      isLoading={isSigningOut}
    />
  );
}

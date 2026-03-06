"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { ApiKeyItem } from "@/components/providers/credentials-provider";

export function RevokeKeyDialog({
  open,
  onOpenChange,
  currentKey,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: ApiKeyItem | null;
  onSuccess?: () => void;
}) {
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!currentKey) return;
    setIsRevoking(true);
    try {
      const res = await fetch(`/api/keys/${currentKey.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to revoke key.");
        return;
      }
      onOpenChange(false);
      onSuccess?.();
      toast.success("API key revoked.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsRevoking(false);
    }
  };

  if (!currentKey) return null;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="text-destructive">
          <AlertTriangle
            className="me-1 inline-block stroke-destructive"
            size={18}
          />{" "}
          Revoke API Key
        </span>
      }
      desc={
        <p>
          Are you sure you want to revoke the key{" "}
          <span className="font-semibold">{currentKey.name}</span> (
          <span className="font-mono text-muted-foreground">
            {currentKey.key_prefix}…
          </span>
          )? This key will no longer work. This action cannot be undone.
        </p>
      }
      confirmText="Revoke"
      destructive
      handleConfirm={handleRevoke}
      isLoading={isRevoking}
    />
  );
}

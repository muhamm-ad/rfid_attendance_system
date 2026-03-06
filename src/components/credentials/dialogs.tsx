"use client";

import { useCredentials } from "@/hooks/use-credentials";
import { GenerateApiKeyDialog } from "@/components/credentials/generate-api-key-dialog";
import { GenerateJwtDialog } from "@/components/credentials/generate-jwt-dialog";
import { RevokeKeyDialog } from "@/components/credentials/revoke-key-dialog";
import { ShowApiKeyDialog } from "@/components/credentials/show-api-key-dialog";

export function CredentialsDialogs({
  onRefreshKeys,
  onJwtGenerated,
}: {
  onRefreshKeys?: () => void;
  onJwtGenerated?: (token: string) => void;
}) {
  const {
    open,
    setOpen,
    currentKey,
    setCurrentKey,
    generatedApiKey,
    setGeneratedApiKey,
  } = useCredentials();

  const closeShowKey = () => {
    setGeneratedApiKey(null);
    setOpen(null);
    onRefreshKeys?.();
  };

  const closeRevokeWithDelay = () => {
    setOpen("revoke");
    setTimeout(() => setCurrentKey(null), 500);
  };

  return (
    <>
      <GenerateApiKeyDialog
        open={open === "add-api-key"}
        onOpenChange={(next) => setOpen(next ? "add-api-key" : null)}
        onSuccess={(apiKey) => {
          setGeneratedApiKey(apiKey);
          setOpen("show-api-key");
        }}
      />

      <RevokeKeyDialog
        open={open === "revoke"}
        onOpenChange={(next) => (next ? setOpen("revoke") : closeRevokeWithDelay())}
        currentKey={currentKey}
        onSuccess={() => {
          closeRevokeWithDelay();
          onRefreshKeys?.();
        }}
      />

      <GenerateJwtDialog
        open={open === "generate-jwt"}
        onOpenChange={(next) => setOpen(next ? "generate-jwt" : null)}
        onSuccess={(token) => onJwtGenerated?.(token)}
      />

      <ShowApiKeyDialog
        open={open === "show-api-key"}
        onOpenChange={(next) => {
          if (!next) closeShowKey();
          else setOpen("show-api-key");
        }}
        apiKey={generatedApiKey}
        onClose={closeShowKey}
      />
    </>
  );
}

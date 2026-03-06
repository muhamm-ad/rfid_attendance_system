"use client";

import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";

export type ApiKeyItem = {
  id: string;
  name: string;
  key_prefix: string;
  lastUsed: string | null;
  createdAt: string;
};

type CredentialsDialogType = "add-api-key" | "revoke" | "generate-jwt" | "show-api-key";

type CredentialsContextType = {
  open: CredentialsDialogType | null;
  setOpen: (open: CredentialsDialogType | null) => void;
  currentKey: ApiKeyItem | null;
  setCurrentKey: React.Dispatch<React.SetStateAction<ApiKeyItem | null>>;
  generatedApiKey: string | null;
  setGeneratedApiKey: React.Dispatch<React.SetStateAction<string | null>>;
};

export const CredentialsContext =
  React.createContext<CredentialsContextType | null>(null);

export function CredentialsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CredentialsDialogType>(null);
  const [currentKey, setCurrentKey] = useState<ApiKeyItem | null>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);

  return (
    <CredentialsContext.Provider
      value={{
        open,
        setOpen,
        currentKey,
        setCurrentKey,
        generatedApiKey,
        setGeneratedApiKey,
      }}
    >
      {children}
    </CredentialsContext.Provider>
  );
}

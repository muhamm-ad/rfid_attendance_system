import React from "react";
import { CredentialsContext } from "@/components/providers/credentials-provider";

export function useCredentials() {
  const ctx = React.useContext(CredentialsContext);
  if (!ctx) {
    throw new Error("useCredentials must be used within <CredentialsProvider>");
  }
  return ctx;
}

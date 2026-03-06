"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/cn-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key } from "lucide-react";
import { CredentialsProvider, type ApiKeyItem } from "@/components/providers/credentials-provider";
import { CredentialsDialogs } from "@/components/credentials/dialogs";
import { useCredentials } from "@/hooks/use-credentials";

export function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SettingsCredentialsContent() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [jwtToken, setJwtToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setOpen, setCurrentKey } = useCredentials();

  const fetchApiKeys = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/keys", { credentials: "include" });
      const data = res.ok ? await res.json() : await res.json().catch(() => ({}));
      if (res.ok) {
        setApiKeys(Array.isArray(data) ? data : []);
      } else {
        setApiKeys([]);
        setError((data as { error?: string }).error ?? "Failed to load API keys.");
      }
    } catch {
      setApiKeys([]);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  return (
    <div className="page-container h-full">
      <PageHeader
        icon={Key}
        title="Credentials"
        subtitle="Manage API keys and JWT tokens for external access."
      />
      {error && (
        <div className="alert-error flex items-center justify-between gap-3" role="alert">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-inherit hover:text-inherit hover:bg-black/10"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            Dismiss
          </Button>
        </div>
      )}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6">
          <SectionCard
            title="API Keys"
            description="For scripts, CLI, and automation. Permanent and revocable keys."
          >
            <Button onClick={() => setOpen("add-api-key")}>Generate API Key</Button>
            <div className="mt-4">
              {loading ? (
                <p className="text-muted-foreground">Loading…</p>
              ) : apiKeys.length === 0 ? (
                <p className="text-muted-foreground">No API keys.</p>
              ) : (
                apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="border border-border p-3 mb-2 rounded flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {key.key_prefix}…
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last used:{" "}
                        {key.lastUsed
                          ? new Date(key.lastUsed).toLocaleString()
                          : "Never"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCurrentKey(key);
                        setOpen("revoke");
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      Revoke
                    </Button>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="JWT Tokens"
            description="For mobile apps and external SPAs. Temporary tokens with expiration."
          >
            <Button onClick={() => setOpen("generate-jwt")} className="mb-4">
              Generate JWT
            </Button>

            {jwtToken && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-mono text-sm break-all">{jwtToken}</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 p-0 h-auto text-primary"
                  onClick={() => navigator.clipboard.writeText(jwtToken)}
                >
                  Copy
                </Button>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
      <CredentialsDialogs
        onRefreshKeys={fetchApiKeys}
        onJwtGenerated={setJwtToken}
      />
    </div>
  );
}

export default function SettingsCredentialsPage() {
  return (
    <CredentialsProvider>
      <SettingsCredentialsContent />
    </CredentialsProvider>
  );
}

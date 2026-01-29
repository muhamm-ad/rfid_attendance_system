// @/app/error.tsx

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--page-gradient) p-6">
      <div className="w-full max-w-md rounded-2xl border border-(--border-color) bg-(--surface) p-8 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-1 text-sm text-(--text-muted)">
              An unexpected error occurred. You can try again, or go back home.
            </p>
            {error?.message && process.env.NODE_ENV === "development" ? (
              <p className="mt-3 wrap-break-word rounded-lg bg-(--surface-muted) px-3 py-2 text-xs text-(--text-muted)">
                {error.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="w-full" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

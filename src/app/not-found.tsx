// @/app/not-found.tsx

"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--page-gradient) p-6">
      <div className="w-full max-w-md rounded-2xl border border-(--border-color) bg-(--surface) p-8 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--brand)/15 text-(--brand)">
            <SearchX className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Page not found
            </h1>
            <p className="mt-1 text-sm text-(--text-muted)">
              The page you're looking for doesn't exist or was moved.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="w-full">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


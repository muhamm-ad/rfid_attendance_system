// @/components/ui/loading.tsx

"use client";

import { Loader2 } from "lucide-react";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-(--page-gradient)">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-(--brand)/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-(--border-color) bg-(--surface) shadow-lg">
          <Loader2
            className="h-8 w-8 animate-spin text-(--brand)"
            strokeWidth={2.5}
            aria-hidden
          />
        </div>
      </div>
      <p className="text-sm font-medium text-(--text-muted) animate-pulse">
        {label}
      </p>
    </div>
  );
}

export default Loading;

// src/app/ui-test/page.tsx — Test error, not-found, and loading pages

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Loading from "@/components/loading";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FileQuestion,
  AlertTriangle,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function ErrorThrower(): never {
  throw new Error("Test error for error.tsx");
}

const LOADING_DURATION_MS = 2500;

export default function UiTestPage() {
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const testNotFound = () => {
    router.push("/this-page-does-not-exist-12345");
  };

  const testError = () => {
    setShowError(true);
  };

  const testLoading = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, LOADING_DURATION_MS));
    setIsLoading(false);
  };

  if (showError) {
    return <ErrorThrower />;
  }

  if (isLoading) {
    return <Loading label="Loading test page..." />;
  }

  return (
    <div className="min-h-screen theme-page py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            Test error & loading pages
          </h1>
          <p className="text-(--text-muted) text-lg">
            Use the buttons below to test not-found, error boundary, and loading UI.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Not Found (404) */}
          <Card className="flex h-full flex-col p-6 hover:shadow-lg transition-shadow theme-card border-(--border-color)">
            <div className="flex flex-1 flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-(--brand)/10">
                  <FileQuestion size={24} className="w-6 h-6 text-(--brand)" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">
                    Not found (404)
                  </h2>
                  <p className="text-sm text-(--text-muted) mb-4">
                    Navigate to a non-existent URL to see <code className="text-xs bg-(--surface-muted) px-1.5 py-0.5 rounded">not-found.tsx</code>.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={testNotFound} className="mt-auto w-full group" variant="default">
              Test 404 page
              <ArrowRight size={16} className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>

          {/* Error boundary */}
          <Card className="flex h-full flex-col p-6 hover:shadow-lg transition-shadow theme-card border-(--border-color)">
            <div className="flex flex-1 flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <AlertTriangle size={24} className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">
                    Error boundary
                  </h2>
                  <p className="text-sm text-(--text-muted) mb-4">
                    Throw an error in this route to see <code className="text-xs bg-(--surface-muted) px-1.5 py-0.5 rounded">error.tsx</code>.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={testError} className="mt-auto w-full group" variant="destructive">
              Test error boundary
              <ArrowRight size={16} className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>

          {/* Loading */}
          <Card className="flex flex-col p-6 hover:shadow-lg transition-shadow theme-card border-(--border-color) md:col-span-2">
            <div className="flex flex-1 flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-(--brand)/10">
                  <Loader2 size={24} className="w-6 h-6 text-(--brand)" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">
                    Loading UI
                  </h2>
                  <p className="text-sm text-(--text-muted) mb-4">
                    Simulates a delay and shows the same full-screen loading component used by <code className="text-xs bg-(--surface-muted) px-1.5 py-0.5 rounded">loading.tsx</code> (spinner + label).
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={testLoading}
              className="mt-auto w-full sm:w-auto min-w-[200px] group"
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="w-4 h-4 mr-2 animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  Test loading state
                  <ArrowRight size={16} className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </Card>
        </div>

        <Card className="mt-8 p-6 bg-(--surface-muted)/50 theme-card border-(--border-color)">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="w-5 h-5 text-(--brand) mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold mb-2 text-foreground">What each test does</h3>
              <ul className="text-sm text-(--text-muted) space-y-1 list-disc list-inside">
                <li><strong>Not found:</strong> navigates to a fake route → <code className="text-xs bg-(--surface) px-1 py-0.5 rounded">not-found.tsx</code> is shown.</li>
                <li><strong>Error boundary:</strong> throws during render → <code className="text-xs bg-(--surface) px-1 py-0.5 rounded">error.tsx</code> is shown (Try again).</li>
                <li><strong>Loading:</strong> displays the shared loading component for {LOADING_DURATION_MS / 1000}s (same as <code className="text-xs bg-(--surface) px-1 py-0.5 rounded">loading.tsx</code>).</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button onClick={() => router.push("/")} variant="ghost">
            ← Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}

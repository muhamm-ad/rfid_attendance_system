// @/components/shared/error-display.tsx

"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export function ErrorDisplay({
  error,
  reset,
  title,
  description,
  tryAgainText,
  backHomeText,
  backHomeHref = "/",
  onBackHome,
  useI18nLink = true,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  description: string;
  tryAgainText: string;
  backHomeText: string;
  backHomeHref?: string;
  onBackHome?: () => void;
  useI18nLink?: boolean;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen-safe flex items-center justify-center px-4 py-16 bg-background">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Error Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full bg-destructive/10 flex items-center justify-center"
            >
              <Icon
                name="alerttriangle"
                size={64}
                className="w-12 h-12 sm:w-16 sm:h-16 text-destructive"
              />
            </motion.div>

            {/* Pulsing ring effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-destructive/30"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md mx-auto"
        >
          {description}
        </motion.p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-left"
          >
            <p className="text-sm font-mono text-destructive/80 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button onClick={reset} size="lg" variant="default" className="group">
            <Icon
              name="refreshcw"
              size={16}
              className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500"
            />
            {tryAgainText}
          </Button>

          {useI18nLink ? (
            <Button asChild size="lg" variant="outline" className="group">
              <Link
                href={backHomeHref}
                title="Home"
                className="inline-flex items-center justify-center"
              >
                <Icon
                  name="home"
                  size={16}
                  className="w-4 h-4 mr-2 group-hover:translate-x-[-2px] transition-transform"
                />
                {backHomeText}
              </Link>
            </Button>
          ) : (
            <motion.button
              onClick={
                onBackHome ||
                (() => {
                  window.location.href = backHomeHref;
                })
              }
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 border-2 border-primary/30 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary hover:shadow-md hover:scale-105 active:scale-95 group"
            >
              <span className="inline-flex items-center justify-center">
                <Icon
                  name="home"
                  size={16}
                  className="w-4 h-4 mr-2 group-hover:translate-x-[-2px] transition-transform"
                />
                {backHomeText}
              </span>
            </motion.button>
          )}
        </motion.div>

        {/* Decorative animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-destructive/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}

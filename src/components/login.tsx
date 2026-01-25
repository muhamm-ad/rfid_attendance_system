// components/login.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { motion } from "framer-motion";

export function Login() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex h-auto min-h-screen items-center justify-center px-8 py-12"
    >
      <Card className="mx-auto border-none shadow-md">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="mb-1.5 text-2xl">
            Sign in to Shadcn Studio
          </CardTitle>
          <CardDescription className="text-base">
            Ship Faster and Focus on Growth.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Login Roles Buttons (Staff and User) Admin is accessible from the /admin route*/}
          <div className="mb-6 flex flex-wrap gap-4 sm:gap-6">
            <Button variant="outline" className="grow">
              Login as Staff
            </Button>
            <Button variant="outline" className="grow">
              {/* User aka Viewer */}
              Login as User
            </Button>
          </div>

          <LoginForm className="space-y-4" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

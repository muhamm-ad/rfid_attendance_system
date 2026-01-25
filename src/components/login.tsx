// components/login.tsx

"use client";

import { useState } from "react";
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
import Image from "next/image";
import loginBg from "@/assets/images/login_bg.png";

type Role = "staff" | "user" | null;

export function Login() {
  const [selectedRole, setSelectedRole] = useState<Role>("user");

  const handleRoleSelect = (role: "staff" | "user") => {
    setSelectedRole(selectedRole === role ? null : role);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex h-auto min-h-screen items-center justify-center px-8 py-12 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 -top-[30%] opacity-60">
          <Image
            src={loginBg}
            alt="Login Background"
            fill
            className="object-cover object-top-left"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <Card className="relative z-10 mx-auto w-full max-w-md border-none shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="mb-1.5 text-2xl font-semibold text-gray-900">
            RFID Access Control
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Login Roles Buttons (Staff and User) Admin is accessible from the /admin route*/}
          <div className="mb-6 flex flex-wrap gap-4 sm:gap-6">
            <Button
              variant={selectedRole === "staff" ? "default" : "outline"}
              className={`grow transition-all ${
                selectedRole === "staff"
                  ? "bg-violet-600 hover:bg-violet-700 text-white border-violet-600 shadow-lg shadow-violet-500/50"
                  : "border-violet-300 text-violet-700 hover:bg-violet-50 hover:border-violet-400"
              }`}
              onClick={() => handleRoleSelect("staff")}
            >
              Login as Staff
            </Button>
            <Button
              variant={selectedRole === "user" ? "default" : "outline"}
              className={`grow transition-all ${
                selectedRole === "user"
                  ? "bg-violet-600 hover:bg-violet-700 text-white border-violet-600 shadow-lg shadow-violet-500/50"
                  : "border-violet-300 text-violet-700 hover:bg-violet-50 hover:border-violet-400"
              }`}
              onClick={() => handleRoleSelect("user")}
            >
              {/* User aka Viewer */}
              Login as User
            </Button>
          </div>

          <LoginForm className="space-y-4" selectedRole={selectedRole} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

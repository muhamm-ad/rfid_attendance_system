// @/components/login.tsx

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import loginBg from "@/assets/images/login_bg.png";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { loginSchema, LoginSchema } from "@/schemas";
import { useTransition } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormMessage as FormStatusMessage } from "@/components/ui/message";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthError } from "next-auth";

export function LoginForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        // Check if sign-in was successful
        if (result?.error) {
          // Handle different error types
          switch (result.error) {
            case "CredentialsSignin":
              setError("Invalid credentials");
              break;
            default:
              setError("An error occurred. Please try again.");
          }
          return;
        }

        // Only redirect if sign-in was successful (no error)
        if (result?.ok) {
          setSuccess("Login successful");
          router.push("/dashboard");
          router.refresh();
        } else {
          setError("An error occurred. Please try again.");
        }
      } catch (err: any) {
        if (err instanceof AuthError) {
          switch (err.type) {
            case "CredentialsSignin":
              setError("Invalid credentials");
              break;
            default:
              setError("An error occurred. Please try again.");
          }
        } else {
          setError("An unexpected error occurred. Please try again.");
          console.error("Login error:", err);
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          rules={{ required: { value: true, message: "Email is required" } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address*</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  className="border-violet-200 focus:border-violet-500 focus:ring-violet-500/20"
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          rules={{ required: { value: true, message: "Password is required" } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password*</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={isVisible ? "text" : "password"}
                    placeholder="••••••••••••••••"
                    className="pr-9 border-violet-200 focus:border-violet-500 focus:ring-violet-500/20"
                    disabled={isPending}
                    {...field}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setIsVisible((prev: boolean) => !prev)}
                    className="text-gray-500 hover:text-violet-600 focus-visible:ring-violet-500/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                  >
                    {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                    <span className="sr-only">
                      {isVisible ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="rememberMe"
            className="size-6 border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
          />
          <Label htmlFor="rememberMe" className="text-gray-600 cursor-pointer">
            Remember Me
          </Label>
        </div>

        {error && <FormStatusMessage type="error" message={error} />}
        {success && <FormStatusMessage type="success" message={success} />}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/50 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed transition-all"
          disabled={isPending}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}

export default function Login({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={
        className
          ? `${className}`
          : `relative flex h-auto min-h-screen items-center justify-center px-8 py-12 overflow-hidden`
      }
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
          <LoginForm />
        </CardContent>
      </Card>
    </motion.div>
  );
}

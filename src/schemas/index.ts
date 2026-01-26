import { z } from "zod";

export const loginSchema = z.object({
  role: z.enum(["admin", "staff", "viewer"], { message: "Invalid role" }),
  email: z.string().email({ message: "Email address is required" }),
  password: z.string().min(8, { message: "Password is required" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

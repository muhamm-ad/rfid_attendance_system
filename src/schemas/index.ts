import { z } from "zod";

export const loginSchema = z.object({
  role: z.enum(["admin", "staff", "user"], { message: "Invalid role" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

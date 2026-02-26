// @/schemas/index.ts

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email address is required" }),
  password: z.string().min(8, { message: "Password is required" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const userFormSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email({
      error: (iss) => (iss.input === "" ? "Email is required." : undefined),
    }),
    password: z.string().transform((pwd) => pwd.trim()),
    role: z.string().min(1, "Role is required."),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isActive: z.boolean(),
    image: z.string().optional(),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true;
      return data.password.length > 0;
    },
    {
      message: "Password is required.",
      path: ["password"],
    },
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true;
      return password.length >= 8;
    },
    {
      message: "Password must be at least 8 characters long.",
      path: ["password"],
    },
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true;
      return /[a-z]/.test(password);
    },
    {
      message: "Password must contain at least one lowercase letter.",
      path: ["password"],
    },
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true;
      return /\d/.test(password);
    },
    {
      message: "Password must contain at least one number.",
      path: ["password"],
    },
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true;
      return password === confirmPassword;
    },
    {
      message: "Passwords don't match.",
      path: ["confirmPassword"],
    },
  );

export type UserForm = z.infer<typeof userFormSchema>;

export const personFormSchema = z.object({
  firstName: z.string().min(1, "First Name is required."),
  lastName: z.string().min(1, "Last Name is required."),
  rfidUuid: z.string().min(1, "RFID UUID is required."),
  type: z.string().min(1, "Type is required."),
  photo: z.string().optional(),
  isEdit: z.boolean(),
});

export type PersonForm = z.infer<typeof personFormSchema>;

// TODO: Add invitation-specific fields when the API is ready (e.g. expiry date, custom message template, resend count…)
export const userInviteSchema = z.object({
  email: z.email({
    error: (iss) =>
      iss.input === "" ? "Please enter an email to invite." : undefined,
  }),
  role: z.string().min(1, "Role is required."),
  desc: z.string().optional(),
});

export type UserInviteForm = z.infer<typeof userInviteSchema>;

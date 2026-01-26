// lib/utils_auth.ts
import { NextRequest } from "next/server";
import { User, UserRole } from "@/prisma/generated/client";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Get the current session user
 * Note: This function requires a request object. For API routes, use getUserFromRequest instead.
 */
export async function getCurrentUser(request?: NextRequest): Promise<SessionUser | null> {
  if (!request) return null;
  return getUserFromRequest(request);
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    staff: 2,
    admin: 3,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can perform write operations
 */
export function canWrite(role: UserRole): boolean {
  return role === "admin" || role === "staff";
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(role: UserRole): boolean {
  return role === "admin";
}

/**
 * Get user from request (for API routes)
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<SessionUser | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "rfid-attendance-secret-key-change-in-production",
  });

  if (!token) return null;

  return {
    id: token.id as string,
    email: token.email as string,
    name: token.name as string,
    role: (token.role as UserRole) || "viewer",
  };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

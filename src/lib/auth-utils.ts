// lib/auth-utils.ts

// TODO : Update this file

import bcrypt from "bcryptjs";
import { User, UserRole } from "../prisma/generated/client";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

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


/**
 * Check if user can perform write operations
 */
export function canWrite(role: UserRole): boolean {
  return role === "ADMIN" || role === "STAFF";
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * Get user from request (for API routes)
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<User | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "rfid-attendance-secret-key-change-in-production",
  });

  if (!token) return null;

  return {
    id: token.id as string,
    email: token.email as string,
    password: token.password as string,
    role: (token.role as UserRole) || "VIEWER",
    is_active: token.is_active as boolean,
    first_name: token.first_name as string | null,
    last_name: token.last_name as string | null,
    image: token.image as string | null,
    createdAt: token.createdAt as Date,
    updatedAt: token.updatedAt as Date,
  };
}


export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Middleware to check authentication for API routes
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "rfid-attendance-secret-key-change-in-production",
  });

  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const user = {
    id: token.id as string,
    email: token.email as string,
    name: token.name as string,
    role: (token.role as UserRole) || "viewer",
  };

  return { user, error: null };
}

/**
 * Middleware to check if user has write permissions
 */
export async function requireWriteAccess(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult;

  if (!canWrite(authResult.user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Insufficient permissions. Write access required." },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult;

  if (!canManageUsers(authResult.user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Middleware to check if user has specific role
 */
export async function requireRole(
  request: NextRequest,
  requiredRole: UserRole
): Promise<{ user: User | null; error: null } | { user: null; error: NextResponse }> {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult;

  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    STAFF: 2,
    ADMIN: 3,
  };

  if (roleHierarchy[authResult.user.role as UserRole] < roleHierarchy[requiredRole]) {
    return {
      user: null,
      error: NextResponse.json(
        { error: `Role '${requiredRole}' or higher required` },
        { status: 403 }
      ),
    };
  }

  return authResult;
}




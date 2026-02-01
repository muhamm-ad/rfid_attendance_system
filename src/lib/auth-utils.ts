// @/lib/auth-utils.ts

// TODO : Update this file

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { User, UserRole } from "../prisma/generated/client";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify, SignJWT } from "jose";


// ======================= API KEYS UTILS ======================

const API_KEY_PREFIX = "rf_";

/**
 * Generate a new API key. Returns the raw key (show once to user) and data for storage.
 */
export function generateApiKey(): {
  rawKey: string;
  keyHash: string;
  keyPrefix: string;
} {
  const randomPart = randomBytes(32).toString("hex");
  const rawKey = `${API_KEY_PREFIX}${randomPart}`;
  return {
    rawKey,
    keyHash: hashApiKey(rawKey),
    keyPrefix: `${API_KEY_PREFIX}${randomPart.slice(0, 6)}`,
  };
}

export type ApiKeyUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

/**
 * Hash an API key for storage or comparison (SHA-256).
 */
export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey, "utf8").digest("hex");
}

/**
 * Verify an API key and return the associated user if valid.
 * Accepts raw key (e.g. rf_xxxx...) and looks up by hash.
 */
export async function verifyApiKey(rawKey: string): Promise<ApiKeyUser | null> {
  if (!rawKey || !rawKey.startsWith(API_KEY_PREFIX)) {
    return null;
  }

  const keyHash = hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { key_hash: keyHash },
    include: { user: true },
  });

  if (!apiKey?.user) {
    return null;
  }

  // Update last_used_at (fire-and-forget, don't block response)
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { last_used_at: new Date() },
    })
    .catch(() => {});

  const u = apiKey.user;
  const name =
    [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || u.email;

  return {
    id: u.id,
    email: u.email,
    name,
    role: u.role,
  };
}

// ======================= JWT UTILS ======================


const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
const DEFAULT_EXPIRES_IN = "30d";

export type JwtPayload = {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

/**
 * Verify a JWT and return the payload if valid.
 */
export async function verifyJWT(token: string): Promise<JwtPayload | null> {
  if (!JWT_SECRET) {
    console.warn("JWT_SECRET or NEXTAUTH_SECRET not set");
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string) ?? undefined,
      role: (payload.role as string) ?? undefined,
      iat: payload.iat as number | undefined,
      exp: payload.exp as number | undefined,
    };
  } catch {
    return null;
  }
}

export { SignJWT };
export const JWT_EXPIRES_IN = DEFAULT_EXPIRES_IN;


// ======================= PASSWORD UTILS ======================


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


// ======================= AUTHENTICATION UTILS ======================


export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  authMethod: "session" | "api-key" | "jwt";
};

export async function authenticate(
  request: NextRequest,
): Promise<AuthUser | null> {
  // 1. Session Auth.js (priority for UI)
  const session = await auth();
  if (session?.user) {
    const role = (session.user as { role?: UserRole }).role ?? "VIEWER";
    return {
      id: session.user.id!,
      email: session.user.email!,
      name: session.user.name ?? undefined,
      role,
      authMethod: "session",
    };
  }

  // 2. API Key (x-api-key header)
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    const user = await verifyApiKey(apiKey);
    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        authMethod: "api-key",
      };
    }
  }

  // 3. Bearer token (API Key or JWT)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    const userFromKey = await verifyApiKey(token);
    if (userFromKey) {
      return {
        id: userFromKey.id,
        email: userFromKey.email,
        name: userFromKey.name,
        role: userFromKey.role as UserRole,
        authMethod: "api-key",
      };
    }

    const payload = await verifyJWT(token);
    if (payload) {
      return {
        id: payload.userId,
        email: payload.email,
        name: payload.name,
        role: (payload.role as UserRole) ?? "VIEWER",
        authMethod: "jwt",
      };
    }
  }

  return null;
}


/**
 * Middleware to check authentication for API routes.
 * Accepts: session (cookie), API Key (x-api-key or Bearer), or JWT (Bearer).
 */
export async function requireAuth(
  request: NextRequest,
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  const authUser = await authenticate(request);
  if (authUser) {
    return {
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name ?? authUser.email,
        role: authUser.role,
      },
      error: null,
    };
  }

  return {
    user: null,
    error: NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    ),
  };
}


// ======================= PERMISSIONS UTILS ======================

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
 * Middleware to check if user has write permissions
 */
export async function requireWriteAccess(
  request: NextRequest,
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult;

  if (!canWrite(authResult.user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Insufficient permissions. Write access required." },
        { status: 403 },
      ),
    };
  }

  return authResult;
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(
  request: NextRequest,
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult;

  if (!canManageUsers(authResult.user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
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
  requiredRole: UserRole,
): Promise<
  { user: User | null; error: null } | { user: null; error: NextResponse }
> {
  const authResult = await requireAuth(request);
  if (authResult.error) return authResult;

  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    STAFF: 2,
    ADMIN: 3,
  };

  if (
    roleHierarchy[authResult.user.role as UserRole] <
    roleHierarchy[requiredRole]
  ) {
    return {
      user: null,
      error: NextResponse.json(
        { error: `Role '${requiredRole}' or higher required` },
        { status: 403 },
      ),
    };
  }

  return authResult;
}

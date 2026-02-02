// @/lib/auth-utils.ts

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { User, UserRole } from "../prisma/generated/client";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify, SignJWT } from "jose";
import { AuthMethod, AuthUser } from "@/types";

// ======================= API KEYS UTILS ======================

const API_KEY_PREFIX = "rf_";

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey, "utf8").digest("hex");
}

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

/**
 * Verify an API key and return the associated user if valid.
 * Accepts raw key (e.g. rf_xxxx...) and looks up by hash.
 */
export async function verifyApiKey(rawKey: string): Promise<AuthUser | null> {
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

  return {
    id: u.id as string,
    email: u.email as string,
    first_name: u.first_name as string | undefined,
    last_name: u.last_name as string | undefined,
    role: u.role as UserRole,
    authMethod: "API_KEY" as AuthMethod,
  };
}

// ======================= JWT UTILS ======================

export const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET;
export const DEFAULT_JWT_EXPIRES_IN = "1h";
export { SignJWT };

export async function verifyJWT(token: string): Promise<AuthUser | null> {
  if (!JWT_SECRET) {
    console.warn("JWT_SECRET or NEXTAUTH_SECRET not set");
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.id as string,
      email: payload.email as string,
      first_name: payload.first_name as string | undefined,
      last_name: payload.last_name as string | undefined,
      role: payload.role as UserRole,
      authMethod: "JWT" as AuthMethod,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

// ======================= AUTHENTICATION UTILS ======================

async function authenticate(request: NextRequest): Promise<AuthUser | null> {
  // 1. Session Auth.js (priority for UI)
  const session = await auth();
  if (session?.user) {
    const u = session.user as User;
    return {
      id: u.id as string,
      email: u.email as string,
      first_name: u.first_name as string | undefined,
      last_name: u.last_name as string | undefined,
      role: u.role as UserRole,
      authMethod: "SESSION" as AuthMethod,
    };
  }

  // 2. API Key (x-api-key header)
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    return await verifyApiKey(apiKey);
  }

  // 3. Bearer token (API Key or JWT)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    return (await verifyApiKey(token)) || (await verifyJWT(token));
  }

  return null;
}

/**
 * Middleware to check authentication for API routes.
 * Accepts: session (cookie), API Key (x-api-key or Bearer), or JWT (Bearer).
 */
export async function requireAuth(
  request: NextRequest,
): Promise<
  | { auth_user: AuthUser | null; error: null }
  | { auth_user: null; error: NextResponse }
> {
  const authUser = await authenticate(request);
  if (authUser) {
    return {
      auth_user: authUser,
      error: null,
    };
  }

  return {
    auth_user: null,
    error: NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    ),
  };
}

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

// ======================= PERMISSIONS UTILS ======================

// import { canWrite, canManageUsers } from "@/data/user";

// /**
//  * Middleware to check if user has write permissions
//  */
// export async function requireWriteAccess(
//   request: NextRequest | AuthUser,
// ): Promise<
//   | { auth_user: AuthUser | null; authorized: true; error: null }
//   | { auth_user: null; authorized: false; error: NextResponse }
// > {
//   const auth_user =
//     request instanceof NextRequest
//       ? (await requireAuth(request)).user
//       : request;

//   if (!user || !(await canWrite(user as User))) {
//     return {
//       user: null,
//       error: NextResponse.json(
//         { error: "Insufficient permissions. Write access required." },
//         { status: 403 },
//       ),
//     };
//   }

//   return authResult;
// }

// /**
//  * Middleware to check if user is admin
//  */
// export async function requireAdmin(
//   request: NextRequest,
// ): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
//   const authResult = await requireAuth(request);
//   if (authResult.error) return authResult;

//   if (!canManageUsers(authResult.user.role)) {
//     return {
//       user: null,
//       error: NextResponse.json(
//         { error: "Admin access required" },
//         { status: 403 },
//       ),
//     };
//   }

//   return authResult;
// }

// /**
//  * Middleware to check if user has specific role
//  */
// export async function requireRole(
//   request: NextRequest,
//   requiredRole: UserRole,
// ): Promise<
//   { user: User | null; error: null } | { user: null; error: NextResponse }
// > {
//   const authResult = await requireAuth(request);
//   if (authResult.error) return authResult;

//   const roleHierarchy: Record<UserRole, number> = {
//     VIEWER: 1,
//     STAFF: 2,
//     ADMIN: 3,
//   };

//   if (
//     roleHierarchy[authResult.user.role as UserRole] <
//     roleHierarchy[requiredRole]
//   ) {
//     return {
//       user: null,
//       error: NextResponse.json(
//         { error: `Role '${requiredRole}' or higher required` },
//         { status: 403 },
//       ),
//     };
//   }

//   return authResult;
// }

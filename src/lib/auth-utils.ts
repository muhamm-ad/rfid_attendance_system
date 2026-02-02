// @/lib/auth-utils.ts

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify, SignJWT } from "jose";
import {
  User,
  UserRole,
  AuthMethod,
  AuthUser,
  ROLE_HIERARCHY,
  RequireAuthResult,
} from "@/types";

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

export const hasRequiredRole = async (
  userRole: UserRole,
  targetRole: UserRole,
): Promise<boolean> => {
  try {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole];
  } catch (error) {
    console.error(error);
    return false;
  }
};

/**
 * Middleware to check authentication for API routes.
 * Accepts: session (cookie), API Key (x-api-key or Bearer), or JWT (Bearer).
 */
async function requireAuth(
  request: NextRequest,
  targetRole: UserRole = "VIEWER",
  errorMessage: string = "Authentication required",
): Promise<RequireAuthResult> {
  const authUser = await authenticate(request);
  if (
    authUser &&
    (await hasRequiredRole(authUser.role as UserRole, targetRole))
  ) {
    return {
      auth_user: authUser,
      error: null,
    };
  }

  return {
    auth_user: null,
    error: NextResponse.json({ error: errorMessage }, { status: 401 }),
  };
}

export async function requireViewerAuth(
  request: NextRequest,
): Promise<RequireAuthResult> {
  return await requireAuth(
    request,
    "VIEWER",
    "Authentication required",
  );
}

export async function requireStaffAuth(
  request: NextRequest,
): Promise<RequireAuthResult> {
  return await requireAuth(
    request,
    "STAFF",
    "Admin or Staff authentication required",
  );
}

export async function requireAdminAuth(
  request: NextRequest,
): Promise<RequireAuthResult> {
  return await requireAuth(
    request,
    "ADMIN",
    "Admin authentication required",
  );
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

// ======================= PRISMA UTILS ======================

export function handlePrismaUniqueConstraintError(
  error: any,
): NextResponse | null {
  if (error.code === "P2002") {
    const target = error.meta?.target?.join(", ");
    if (target) {
      return NextResponse.json(
        { error: `Conflict: ${target} already used` },
        { status: 409 },
      );
    } else {
      return NextResponse.json(
        { error: "Conflict: Unique constraint violation" },
        { status: 409 },
      );
    }
  }
  return null;
}

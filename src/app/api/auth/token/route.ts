// @/app/api/auth/token/route.ts

// * API should be only used by session authenticated users in the UI to generate a JWT token.

import { NextRequest, NextResponse } from "next/server";
import {
  SignJWT,
  DEFAULT_JWT_EXPIRES_IN,
  JWT_SECRET,
  authenticateSession,
} from "@/lib";

/**
 * POST: Generate a JWT token for the current user.
 */
export async function POST(request: NextRequest) {
  try {
    const auth_user = await authenticateSession();
    if (!auth_user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawExpiresIn =
      typeof body.expiresIn === "string" ? body.expiresIn.trim() : null;
    const EXPIRES_IN_REGEX = /^[1-9]\d{0,2}[smhd]$/;
    const expiresIn =
      rawExpiresIn && EXPIRES_IN_REGEX.test(rawExpiresIn)
        ? rawExpiresIn
        : DEFAULT_JWT_EXPIRES_IN;

    const secret = new TextEncoder().encode(JWT_SECRET);
    if (!secret.byteLength) {
      return NextResponse.json(
        { error: "Server misconfiguration: JWT secret not set" },
        { status: 500 },
      );
    }

    const token = await new SignJWT({ ...auth_user, authMethod: "JWT" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expiresIn)
      .setIssuedAt()
      .sign(secret);

    return NextResponse.json({
      token,
      expiresIn,
    });
  } catch (error) {
    console.error("❌ Error generating JWT token:", error);
    return NextResponse.json(
      { error: "Error generating JWT token" },
      { status: 500 },
    );
  }
}

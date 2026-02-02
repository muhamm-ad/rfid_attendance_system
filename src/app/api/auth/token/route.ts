// @/app/api/auth/token/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth, SignJWT, DEFAULT_JWT_EXPIRES_IN, JWT_SECRET } from "@/lib";

/**
 * POST: Generate a JWT token for the current user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
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

    const role = (session.user as { role?: string }).role ?? "VIEWER";

    const token = await new SignJWT({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? undefined,
      role,
    })
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

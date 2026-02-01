// @/app/api/auth/token/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth, SignJWT, JWT_EXPIRES_IN } from "@/lib";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const expiresIn = (body.expiresIn as string) ?? JWT_EXPIRES_IN;

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
    );
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

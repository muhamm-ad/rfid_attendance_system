// @/app/api/keys/[id]/route.ts

// * API should be only used by session authenticated users in the UI to manage their own keys.

import { NextRequest, NextResponse } from "next/server";
import { authenticateSession, prisma } from "@/lib";

/**
 * DELETE: Revoke an API key (any authenticated user). Key must belong to the current user.
 * Resolves user from DB by id or email so revoke works even if session id is stale.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth_user = await authenticateSession();
    if (!auth_user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: auth_user.id }, { email: auth_user.email }],
      },
      select: { id: true },
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found. Please log out and log in again." },
        { status: 401 },
      );
    }

    const { id } = await params;

    const key = await prisma.apiKey.findFirst({
      where: { id, user_id: dbUser.id },
    });

    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKey.delete({ where: { id } });

    return NextResponse.json({ success: true, revoked: id });
  } catch (error) {
    console.error("❌ Error revoking API key:", error);
    return NextResponse.json(
      { error: "Error revoking API key" },
      { status: 500 },
    );
  }
}

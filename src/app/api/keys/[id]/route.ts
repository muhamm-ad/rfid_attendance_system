// @/app/api/keys/[id]/route.ts

// * API should be only used by session authenticated users in the UI to manage their own keys.

import { NextResponse } from "next/server";
import { authenticateSession, prisma } from "@/lib";

/**
 * DELETE: Revoke an API key (any authenticated user). Key must belong to the current user.
 */
export async function DELETE(
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth_user = await authenticateSession();
    if (!auth_user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const key = await prisma.apiKey.findFirst({
      where: { id, user_id: auth_user!.id },
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

// @/app/api/keys/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma, auth } from "@/lib";

/**
 * DELETE: Revoke an API key. Key must belong to the current user.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const key = await prisma.apiKey.findFirst({
      where: { id, user_id: session.user.id },
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

// @/app/api/keys/route.ts

// * API should be only used by session authenticated users in the UI to manage their own keys.

import { NextRequest, NextResponse } from "next/server";
import { prisma, generateApiKey, authenticateSession } from "@/lib";

/**
 * GET: List API keys for the current user (any authenticated user).
 */
export async function GET(request: NextRequest) {
  try {
    const auth_user = await authenticateSession();
    if (!auth_user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await prisma.apiKey.findMany({
      where: { user_id: auth_user!.id },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        key_prefix: true,
        last_used_at: true,
        created_at: true,
      },
    });

    return NextResponse.json(
      keys.map(
        (k: {
          id: string;
          name: string;
          key_prefix: string;
          last_used_at: Date | null;
          created_at: Date;
        }) => ({
          id: k.id,
          name: k.name,
          key_prefix: k.key_prefix,
          lastUsed: k.last_used_at?.toISOString() ?? null,
          createdAt: k.created_at.toISOString(),
        }),
      ),
    );
  } catch (error) {
    console.error("❌ Error listing API keys:", error);
    return NextResponse.json(
      { error: "Error listing API keys" },
      { status: 500 },
    );
  }
}

/**
 * POST: Create a new API key (any authenticated user). Returns raw key once.
 */
export async function POST(request: NextRequest) {
  try {
    const auth_user = await authenticateSession();
    if (!auth_user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const MAX_KEY_NAME_LENGTH = 100;
    const sanitizeKeyName = (s: string) =>
      s
        .replace(/[\x00-\x1F\x7F]/g, "")
        .slice(0, MAX_KEY_NAME_LENGTH)
        .trim();
    const rawName =
      typeof body.name === "string" ? sanitizeKeyName(body.name) : "";
    const name = rawName || "API Key";

    const { rawKey, keyHash, keyPrefix } = generateApiKey();

    await prisma.apiKey.create({
      data: {
        user_id: auth_user!.id,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
      },
    });

    return NextResponse.json({
      apiKey: rawKey,
      name,
      key_prefix: keyPrefix,
      message: "Store this key securely. It will not be shown again.",
    });
  } catch (error) {
    console.error("❌ Error generating API key:", error);
    return NextResponse.json(
      { error: "Error generating API key" },
      { status: 500 },
    );
  }
}

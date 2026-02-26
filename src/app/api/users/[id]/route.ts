import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, hashPassword, validatePassword } from "@/lib";
import {
  getUserById,
  updateUser,
  deleteUser,
  getUserByEmail,
} from "@/data/user";
import { UserRole } from "@/types";

function sanitizeUser(u: {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  first_name: string | null;
  last_name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    is_active: u.is_active,
    first_name: u.first_name,
    last_name: u.last_name,
    image: u.image,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminAuth(request);
  if (error) return error;

  const { id } = await params;
  const user = await getUserById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(
    sanitizeUser(user as Parameters<typeof sanitizeUser>[0]),
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, auth_user } = await requireAdminAuth(request);
  if (error) return error;

  const { id } = await params;
  const user = await getUserById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body: {
    email?: string;
    password?: string;
    role?: UserRole;
    first_name?: string | null;
    last_name?: string | null;
    is_active?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.password !== undefined) {
    const validation = validatePassword(body.password);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join("; ") },
        { status: 400 },
      );
    }
  }

  const validRoles: UserRole[] = ["ADMIN", "STAFF", "VIEWER"];
  const updates: Partial<typeof user> = {};
  if (body.role !== undefined && validRoles.includes(body.role)) {
    updates.role = body.role;
  }
  if (body.is_active !== undefined) {
    updates.is_active = body.is_active;
  }
  if (body.first_name !== undefined) {
    updates.first_name = body.first_name;
  }
  if (body.last_name !== undefined) {
    updates.last_name = body.last_name;
  }
  if (body.email !== undefined && body.email.trim()) {
    const existing = await getUserByEmail(body.email.trim());
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: "Another user with this email already exists" },
        { status: 409 },
      );
    }
    updates.email = body.email.trim();
  }
  if (body.password !== undefined && body.password) {
    updates.password = await hashPassword(body.password);
  }

  const updated = await updateUser({ ...user, ...updates } as any);
  if (!updated) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    sanitizeUser(updated as Parameters<typeof sanitizeUser>[0]),
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdminAuth(request);
  if (error) return error;

  const { id } = await params;
  const user = await getUserById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await deleteUser(id);
  return NextResponse.json({ success: true });
}

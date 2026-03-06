import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, hashPassword, validatePassword } from "@/lib";
import {
  getAllUsers,
  createUser,
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

export async function GET(request: NextRequest) {
  const { error } = await requireAdminAuth(request);
  if (error) return error;

  const users = await getAllUsers();
  return NextResponse.json(
    users.map((u) => sanitizeUser(u as Parameters<typeof sanitizeUser>[0]))
  );
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminAuth(request);
  if (error) return error;

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
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { email, password, role, first_name, last_name, is_active } = body;
  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "email is required" },
      { status: 400 }
    );
  }
  if (!password || typeof password !== "string") {
    return NextResponse.json(
      { error: "password is required" },
      { status: 400 }
    );
  }

  const validation = validatePassword(password);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.errors.join("; ") },
      { status: 400 }
    );
  }

  const validRoles: UserRole[] = ["ADMIN", "CASHIER", "MANAGER"];
  const chosenRole = validRoles.includes(role as UserRole) ? role : "MANAGER";

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const hashed = await hashPassword(password);
  const newUser = await createUser({
    id: crypto.randomUUID(),
    email,
    password: hashed,
    role: chosenRole as UserRole,
    is_active: is_active ?? true,
    first_name: first_name ?? null,
    last_name: last_name ?? null,
    image: null,
  } as any);

  if (!newUser) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }

  return NextResponse.json(sanitizeUser(newUser as Parameters<typeof sanitizeUser>[0]));
}

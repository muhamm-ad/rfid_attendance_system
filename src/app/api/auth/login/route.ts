// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema, LoginSchema } from "@/schemas";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { LoginResponse } from "@/lib/type";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body);
    // validate the body with the loginSchema

    const respondBody: LoginResponse = {
      message: "Login successful",
      success: true,
    };

    return NextResponse.json(respondBody);
  } catch (error) {
    const respondBody: LoginResponse = {
      message: "Login failed",
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(respondBody, { status: 500 });
  }
}

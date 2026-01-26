// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { loginSchema, LoginSchema } from "@/schemas";
import { LoginResponse } from "@/lib/type";
import { getUserByEmail, verifyPassword } from "@/data/user";
import { User, UserRole } from "@/prisma/generated/client";

export async function POST(request: NextRequest) {
  const respondBody: LoginResponse = {
    message: "Login successful",
    success: true,
  };

  try {
    const body: LoginSchema = await request.json();
    const validatedBody = loginSchema.safeParse(body);

    if (!validatedBody.success) {
      respondBody.success = false;
      respondBody.message = "Invalid fields";
      respondBody.error = validatedBody.error.message;
      return NextResponse.json(respondBody, { status: 400 });
    }

    //  validate role to be staff or user if not return error admin access route
    if (validatedBody.data.role === "admin") {
      respondBody.success = false;
      respondBody.message = "Invalid role";
      respondBody.error =
        "Access denied, if you are an admin, please use the admin login page";
      return NextResponse.json(respondBody, { status: 400 });
    }

    const user = await getUserByEmail(validatedBody.data.email);
    if (!user) {
      respondBody.success = false;
      respondBody.message = "User not found";
      respondBody.error = "User not found";
      return NextResponse.json(respondBody, { status: 404 });
    }
    const isPasswordValid = await verifyPassword(
      user,
      validatedBody.data.password,
    );
    if (!isPasswordValid) {
      respondBody.success = false;
      respondBody.message = "Invalid password";
      respondBody.error = "Invalid password";
      return NextResponse.json(respondBody, { status: 401 });
    }
    // TODO: create a session
    // TODO: return the session

    return NextResponse.json(respondBody);
  } catch (error) {
    respondBody.success = false;
    respondBody.message = "Login failed";
    respondBody.error = "Internal server error";
    return NextResponse.json(respondBody, { status: 500 });
  }
}

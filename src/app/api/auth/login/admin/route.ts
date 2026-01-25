// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { loginSchema, LoginSchema } from "@/schemas";
import { LoginResponse } from "@/lib/type";

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
      respondBody.message = "Invalid credentials";
      respondBody.error = validatedBody.error.message;
      return NextResponse.json(respondBody, { status: 400 });
    }

    //  validate role to be staff or user if not return error admin access route
    if (validatedBody.data.role !== "admin") {
      respondBody.success = false;
      respondBody.message = "Invalid role";
      respondBody.error = "Access denied only admin can login with this route";
      return NextResponse.json(respondBody, { status: 400 });
    }

    // TODO: Find the admin user by email


    
    return NextResponse.json(respondBody);
  } catch (error) {
    respondBody.success = false;
    respondBody.message = "Login failed";
    respondBody.error = "Internal server error";
    return NextResponse.json(respondBody, { status: 500 });
  }
}

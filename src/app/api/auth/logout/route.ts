// app/api/auth/logout/route.ts

import { LogoutResponse } from "@/lib/type";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body);

    const respondBody: LogoutResponse = {
      message: "Logout successful",
      success: true,
    };
    return NextResponse.json(respondBody);
  } catch (error) {
    const respondBody: LogoutResponse = {
      message: "Logout failed",
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(respondBody, { status: 500 });
  }
}

// @/proxy.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib";

export const PUBLIC_ROUTES = ["/documentation"];
export const ADMIN_ROUTES = ["/dashboard/admin", "/admin"];

/** True if pathname is an admin route or a sub-route (e.g. /dashboard/admin/users). */
export function isAdminRoutePath(pathname: string): boolean {
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

export const AUTH_ROUTES = ["/login", "/logout"];
export const API_AUTH_PREFIX = "/api"; // Use for api authentication purpose
export const DEFAULT_REDIRECT = "/dashboard";

export default auth((req) => {
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith(API_AUTH_PREFIX);
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.includes(nextUrl.pathname);
  const isLoggedIn = !!req.auth;
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminRoutePath(nextUrl.pathname)) {
    const userRole = req.auth?.user?.role;
    const isAdmin = userRole === "ADMIN";
    if (!isAdmin) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Use the edge-compatible authConfig — no Prisma, no Node.js-only imports
const { auth } = NextAuth(authConfig);

// /api/mobile routes are protected by their own JWT (verifyMobileToken),
// not by NextAuth — they must be public here to allow unauthenticated access
const PUBLIC_ROUTES = ["/login", "/api/auth", "/api/mobile"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!req.auth && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

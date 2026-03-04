import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessRoute, getRedirectPath } from "@/lib/rbac/routes";
import { Role } from "@prisma/client";

export async function middleware(request: NextRequest) {
  // Use getToken instead of auth() to avoid Prisma in edge runtime
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;

  // Public routes - no authentication required
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/samples") ||
    pathname.startsWith("/about-us") ||
    pathname.startsWith("/payment") ||
    pathname.startsWith("/contact-us") ||
    pathname.startsWith("/terms-of-service") ||
    pathname.startsWith("/privacy-policy") ||
    pathname.startsWith("/refund-policy") ||
    pathname.startsWith("/payment-policy") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/services") ||
    pathname.startsWith("/api/categories") ||
    pathname.startsWith("/api/portfolio") ||
    pathname.startsWith("/api/blog") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/faqs") ||
    pathname.startsWith("/api/testimonials") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")

  ) {
    return NextResponse.next();
  }
 
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
 
  const role = token.role as Role;
  const permissions = (token.permissions as string[] | null | undefined) || null;
  if (!canAccessRoute(role, pathname, permissions)) {
    const redirectPath = getRedirectPath(role);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

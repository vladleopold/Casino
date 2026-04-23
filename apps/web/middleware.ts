import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const OPS_MODE = process.env.NEXT_PUBLIC_APP_KIND?.trim().toLowerCase() === "ops";

function isAllowedOpsPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/operator") ||
    pathname.startsWith("/api/ops") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/operator") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/slotcity") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.includes(".")
  );
}

export function middleware(request: NextRequest) {
  if (!OPS_MODE) {
    return NextResponse.next();
  }

  if (isAllowedOpsPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/operator/payments";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/:path*"
};

import { NextResponse } from "next/server";

import { isOpsApp } from "../../../../../lib/app-kind";
import {
  consumeOpsBridgeToken,
  createOpsSessionToken,
  getOpsSessionCookieName,
  getOpsSessionCookieOptions
} from "../../../../../lib/auth/ops-session";
import { getFinanceAdminUserByEmail } from "../../../../../lib/auth/finance-admin";
import { sanitizeRelativePath } from "../../../../../lib/site-urls";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isOpsApp()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Not found"
      },
      {
        status: 404
      }
    );
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const nextPath = sanitizeRelativePath(url.searchParams.get("next"), "/operator/payments");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=access_denied", request.url));
  }

  const bridgeSession = await consumeOpsBridgeToken(token);

  if (!bridgeSession) {
    return NextResponse.redirect(new URL("/login?error=access_denied", request.url));
  }

  const admin = await getFinanceAdminUserByEmail(bridgeSession.email);

  if (!admin) {
    return NextResponse.redirect(new URL("/login?error=access_denied", request.url));
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(
    getOpsSessionCookieName(),
    createOpsSessionToken(admin),
    getOpsSessionCookieOptions()
  );
  return response;
}

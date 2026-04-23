import { NextResponse } from "next/server";

import { isOpsApp } from "../../../../../lib/app-kind";
import { getOpsSessionCookieName, getOpsSessionCookieOptions } from "../../../../../lib/auth/ops-session";

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

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(getOpsSessionCookieName(), "", {
    ...getOpsSessionCookieOptions(),
    maxAge: 0
  });
  return response;
}

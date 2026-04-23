import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { isOpsApp } from "../../../../../lib/app-kind";
import { authOptions } from "../../../../../lib/auth/options";
import { getFinanceAdminUserByEmail } from "../../../../../lib/auth/finance-admin";
import { createOpsBridgeToken } from "../../../../../lib/auth/ops-session";
import { getFinanceOpsUrl, sanitizeRelativePath } from "../../../../../lib/site-urls";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (isOpsApp()) {
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

  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const nextPath = sanitizeRelativePath(url.searchParams.get("next"), "/operator/payments");
  const financeOpsUrl = getFinanceOpsUrl();

  if (!session?.user?.email) {
    return NextResponse.redirect(`${financeOpsUrl}/login?error=access_denied`);
  }

  const admin = await getFinanceAdminUserByEmail(session.user.email);

  if (!admin) {
    return NextResponse.redirect(`${financeOpsUrl}/login?error=access_denied`);
  }

  const bridgeToken = createOpsBridgeToken(admin);
  const targetUrl = new URL("/api/ops/session/complete", financeOpsUrl);
  targetUrl.searchParams.set("token", bridgeToken);
  targetUrl.searchParams.set("next", nextPath);

  return NextResponse.redirect(targetUrl);
}

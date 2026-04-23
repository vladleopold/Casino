import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { isOpsApp } from "../../../../lib/app-kind";
import { authOptions } from "../../../../lib/auth/options";
import { hasFinanceAdminAccess } from "../../../../lib/auth/finance-admin";
import {
  getFinanceOverview,
  listStorefrontUsersForAdmin,
  listDepositRequestsForAdmin,
  listLedgerEntriesForAdmin
} from "../../../../lib/auth/store-users";

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

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized"
      },
      {
        status: 401
      }
    );
  }

  if (!(await hasFinanceAdminAccess(session.user.email))) {
    return NextResponse.json(
      {
        ok: false,
        message: "Forbidden"
      },
      {
        status: 403
      }
    );
  }

  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "240");

    const [overview, requests, ledger, users] = await Promise.all([
      getFinanceOverview(),
      listDepositRequestsForAdmin({
        limit,
        status: "all"
      }),
      listLedgerEntriesForAdmin({
        limit: 180
      }),
      listStorefrontUsersForAdmin(500)
    ]);

    return NextResponse.json({
      ok: true,
      overview,
      requests,
      ledger,
      users
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити фінансову адмінку."
      },
      {
        status: 503
      }
    );
  }
}

import { NextResponse } from "next/server";

import { isOpsApp } from "../../../../lib/app-kind";
import { getOpsAdminSession } from "../../../../lib/auth/ops-session";
import { listStorefrontUsersForAdmin } from "../../../../lib/auth/store-users";

export const runtime = "nodejs";

async function authorizeOperator() {
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

  const session = await getOpsAdminSession();

  if (!session?.email) {
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

  return session;
}

export async function GET(request: Request) {
  const auth = await authorizeOperator();

  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "500");
    const users = await listStorefrontUsersForAdmin(limit);

    return NextResponse.json({
      ok: true,
      users
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити список гравців."
      },
      {
        status: 503
      }
    );
  }
}

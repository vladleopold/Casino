import { NextResponse } from "next/server";

import { isOpsApp } from "../../../../../../lib/app-kind";
import { getOpsAdminSession } from "../../../../../../lib/auth/ops-session";
import { approveDepositRequest } from "../../../../../../lib/auth/store-users";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: {
    params: Promise<{
      depositId: string;
    }>;
  }
) {
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

  if (!session?.adminId) {
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

  const { depositId } = await context.params;

  try {
    const result = await approveDepositRequest({
      depositId,
      approvedBy: session.email
    });

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Не вдалося підтвердити поповнення."
      },
      {
        status: 400
      }
    );
  }
}

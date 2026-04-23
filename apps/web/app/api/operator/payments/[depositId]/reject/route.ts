import { NextResponse } from "next/server";
import { z } from "zod";

import { isOpsApp } from "../../../../../../lib/app-kind";
import { getOpsAdminSession } from "../../../../../../lib/auth/ops-session";
import { rejectDepositRequest } from "../../../../../../lib/auth/store-users";

export const runtime = "nodejs";

const rejectSchema = z.object({
  reason: z.string().min(2).max(500).optional()
});

export async function POST(
  request: Request,
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

  const payload = await request.json().catch(() => null);
  const parsed = rejectSchema.safeParse(payload ?? {});
  const { depositId } = await context.params;

  try {
    const result = await rejectDepositRequest({
      depositId,
      rejectedBy: session.email,
      reason: parsed.success ? parsed.data.reason : undefined
    });

    return NextResponse.json({
      ok: true,
      request: result
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Не вдалося відхилити поповнення."
      },
      {
        status: 400
      }
    );
  }
}

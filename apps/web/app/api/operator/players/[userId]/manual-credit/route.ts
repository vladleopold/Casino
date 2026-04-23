import { NextResponse } from "next/server";
import { z } from "zod";

import { isOpsApp } from "../../../../../../lib/app-kind";
import { getOpsAdminSession } from "../../../../../../lib/auth/ops-session";
import { manualCreditStorefrontUser } from "../../../../../../lib/auth/store-users";

export const runtime = "nodejs";

const creditSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  note: z.string().max(500).optional()
});

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

export async function POST(
  request: Request,
  context: {
    params: Promise<{ userId: string }>;
  }
) {
  const auth = await authorizeOperator();

  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = await request.json().catch(() => null);
  const parsed = creditSchema.safeParse(payload ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Некоректна сума або примітка нарахування."
      },
      {
        status: 400
      }
    );
  }

  const { userId } = await context.params;

  try {
    const user = await manualCreditStorefrontUser({
      userId,
      amount: parsed.data.amount,
      note: parsed.data.note ?? null,
      createdBy: auth.email
    });

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "Гравця не знайдено."
        },
        {
          status: 404
        }
      );
    }

    return NextResponse.json({
      ok: true,
      user
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося виконати ручне нарахування."
      },
      {
        status: 400
      }
    );
  }
}

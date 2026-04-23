import { NextResponse } from "next/server";
import { z } from "zod";

import { isOpsApp } from "../../../../../lib/app-kind";
import { getOpsAdminSession } from "../../../../../lib/auth/ops-session";
import {
  getStorefrontUserFinanceProfile,
  updateStorefrontUserAdminState
} from "../../../../../lib/auth/store-users";

export const runtime = "nodejs";

const updateSchema = z.object({
  status: z.enum(["active", "blocked"]).optional(),
  isVip: z.boolean().optional(),
  password: z.string().min(8).max(128).optional()
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

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ userId: string }>;
  }
) {
  const auth = await authorizeOperator();

  if (auth instanceof NextResponse) {
    return auth;
  }

  const { userId } = await context.params;
  const profile = await getStorefrontUserFinanceProfile(userId);

  if (!profile) {
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
    profile
  });
}

export async function PATCH(
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
  const parsed = updateSchema.safeParse(payload ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Некоректні поля оновлення гравця."
      },
      {
        status: 400
      }
    );
  }

  const { userId } = await context.params;

  try {
    const user = await updateStorefrontUserAdminState({
      userId,
      status: parsed.data.status,
      isVip: parsed.data.isVip,
      password: parsed.data.password,
      updatedBy: auth.email
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
            : "Не вдалося оновити гравця."
      },
      {
        status: 400
      }
    );
  }
}

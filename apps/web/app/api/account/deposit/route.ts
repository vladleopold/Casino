import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "../../../../lib/auth/options";
import { incrementUserBalance } from "../../../../lib/auth/store-users";

export const runtime = "nodejs";

const depositSchema = z.object({
  amount: z.number().positive().max(1_000_000)
});

export async function POST(request: Request) {
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

  const payload = await request.json().catch(() => null);
  const parsed = depositSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Некоректна сума поповнення."
      },
      {
        status: 400
      }
    );
  }

  const user = await incrementUserBalance({
    userId: session.user.id,
    amount: Math.round(parsed.data.amount)
  });

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "User not found."
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
}

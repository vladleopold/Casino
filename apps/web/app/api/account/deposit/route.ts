import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "../../../../lib/auth/options";
import { createDepositRequest } from "../../../../lib/auth/store-users";

export const runtime = "nodejs";

const depositSchema = z.object({
  amount: z.number().int().positive().max(1_000_000),
  paymentMethod: z.string().min(2).max(64),
  paymentProvider: z.string().min(2).max(64).optional(),
  payerName: z.string().min(2).max(128).optional(),
  payerEmail: z.string().email().optional(),
  payerPhone: z.string().min(5).max(32).optional(),
  notes: z.string().max(500).optional()
});

export async function POST(request: Request) {
  try {
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

    const depositRequest = await createDepositRequest({
      userId: session.user.id,
      amount: parsed.data.amount,
      paymentMethod: parsed.data.paymentMethod,
      paymentProvider: parsed.data.paymentProvider,
      payerName: parsed.data.payerName,
      payerEmail: parsed.data.payerEmail ?? session.user.email ?? undefined,
      payerPhone: parsed.data.payerPhone,
      notes: parsed.data.notes
    });

    return NextResponse.json({
      ok: true,
      request: depositRequest
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося створити заявку на поповнення."
      },
      {
        status: 400
      }
    );
  }
}

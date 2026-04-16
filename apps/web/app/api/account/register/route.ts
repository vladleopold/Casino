import { NextResponse } from "next/server";
import { z } from "zod";

import { createCredentialUser, isStoreAuthConfigured } from "../../../../lib/auth/store-users";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(32).optional()
});

export async function POST(request: Request) {
  if (!isStoreAuthConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Auth storage is not configured."
      },
      {
        status: 503
      }
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Перевірте email і пароль. Мінімум 8 символів."
      },
      {
        status: 400
      }
    );
  }

  try {
    const user = await createCredentialUser(parsed.data);

    return NextResponse.json({
      ok: true,
      user
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Не вдалося створити користувача."
      },
      {
        status: 400
      }
    );
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { isOpsApp } from "../../../../lib/app-kind";
import {
  addFinanceAdminUser,
  listFinanceAdminUsers,
  removeFinanceAdminUser
} from "../../../../lib/auth/finance-admin";
import { getOpsAdminSession } from "../../../../lib/auth/ops-session";

export const runtime = "nodejs";

const addSchema = z.object({
  email: z.string().email(),
  role: z.enum(["super_admin", "admin"]).optional()
});

const removeSchema = z.object({
  email: z.string().email()
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

export async function GET() {
  const auth = await authorizeOperator();

  if (auth instanceof NextResponse) {
    return auth;
  }

  const admins = await listFinanceAdminUsers();
  return NextResponse.json({
    ok: true,
    admins
  });
}

export async function POST(request: Request) {
  const auth = await authorizeOperator();

  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = await request.json().catch(() => null);
  const parsed = addSchema.safeParse(payload ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Невірна email-адреса або роль."
      },
      {
        status: 400
      }
    );
  }

  const admin = await addFinanceAdminUser({
    email: parsed.data.email,
    role: parsed.data.role ?? "admin",
    createdBy: auth.email
  });

  return NextResponse.json({
    ok: true,
    admin
  });
}

export async function DELETE(request: Request) {
  const auth = await authorizeOperator();

  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = await request.json().catch(() => null);
  const parsed = removeSchema.safeParse(payload ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Невірна email-адреса."
      },
      {
        status: 400
      }
    );
  }

  await removeFinanceAdminUser({
    email: parsed.data.email,
    removedBy: auth.email
  });

  return NextResponse.json({
    ok: true
  });
}

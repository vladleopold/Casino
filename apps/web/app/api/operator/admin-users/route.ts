import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { isOpsApp } from "../../../../lib/app-kind";
import { authOptions } from "../../../../lib/auth/options";
import {
  addFinanceAdminUser,
  hasFinanceAdminAccess,
  listFinanceAdminUsers,
  removeFinanceAdminUser
} from "../../../../lib/auth/finance-admin";

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

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
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
    createdBy: auth.user.email
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
    removedBy: auth.user.email
  });

  return NextResponse.json({
    ok: true
  });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../../../lib/auth/options";
import { getStorefrontUserFinanceProfile } from "../../../../lib/auth/store-users";

export const runtime = "nodejs";

export async function GET() {
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

    const profile = await getStorefrontUserFinanceProfile(session.user.id);

    if (!profile) {
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
      profile
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Не вдалося завантажити профіль гравця."
      },
      {
        status: 503
      }
    );
  }
}

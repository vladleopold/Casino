import { NextRequest, NextResponse } from "next/server";
import {
  adaptDemoUrlForDevice,
  buildSlotcityDemoLookupKeys,
  findSlotcityDemoFallbackUrl,
  inferDemoDeviceKind
} from "@slotcity/cms-sdk";

declare const process: {
  env: Record<string, string | undefined>;
};

interface SlotcityDemoApiResponse {
  status?: boolean;
  url?: string;
}

const SOURCE_SITE_URL = (process.env.SLOTCITY_SOURCE_SITE_URL ?? "https://slotcity.ua").replace(
  /\/$/,
  ""
);

async function resolveDemoSourceUrl(slug: string, name?: string | null) {
  const deviceKind = inferDemoDeviceKind(undefined);
  const providerFallback = findSlotcityDemoFallbackUrl(slug, name);

  if (providerFallback?.url) {
    return {
      demoSourceUrl: providerFallback.url,
      resolvedTerm: providerFallback.key
    };
  }

  const lookupTerms = buildSlotcityDemoLookupKeys(slug, name);

  for (const term of lookupTerms) {
    try {
      const response = await fetch(
        `${SOURCE_SITE_URL}/apiv2/games/demo?term=${encodeURIComponent(
          term
        )}&language=uk&check_limits=1&version=desktop`,
        {
          cache: "no-store",
          headers: {
            accept: "application/json,text/plain,*/*",
            referer: `${SOURCE_SITE_URL}/game/${encodeURIComponent(term)}`,
            "user-agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
          }
        }
      );

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as SlotcityDemoApiResponse;

      if (payload.status && typeof payload.url === "string" && payload.url.length > 0) {
        return {
          demoSourceUrl: payload.url,
          resolvedTerm: term
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const name = request.nextUrl.searchParams.get("name");
  const shouldRedirect = request.nextUrl.searchParams.get("redirect") === "1";
  const deviceKind = inferDemoDeviceKind(request.headers.get("user-agent"));

  if (!slug) {
    return NextResponse.json({ status: false, error: "slug is required" }, { status: 400 });
  }

  const resolved = await resolveDemoSourceUrl(slug, name);
  const adaptedDemoSourceUrl = adaptDemoUrlForDevice(resolved?.demoSourceUrl, deviceKind);

  if (!resolved || !adaptedDemoSourceUrl) {
    return NextResponse.json(
      { status: false, error: "demo source not found", slug, name },
      { status: 404 }
    );
  }

  if (shouldRedirect) {
    return NextResponse.redirect(adaptedDemoSourceUrl);
  }

  return NextResponse.json({
    status: true,
    slug,
    name,
    resolvedTerm: resolved.resolvedTerm,
    demoSourceUrl: adaptedDemoSourceUrl
  });
}

import { NextResponse } from "next/server";

import { buildEventsServiceUrl, createActivityHeaders } from "../../_lib";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      userKey: string;
    }>;
  }
) {
  const { userKey } = await context.params;
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") ?? "80";
  const targetUrl = buildEventsServiceUrl(
    `activity/users/${encodeURIComponent(userKey)}?limit=${encodeURIComponent(limit)}`
  );

  if (!targetUrl) {
    return NextResponse.json(
      {
        error: "missing_events_api_url"
      },
      {
        status: 503
      }
    );
  }

  const response = await fetch(targetUrl, {
    headers: createActivityHeaders(),
    cache: "no-store"
  });

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json"
    }
  });
}

import { NextResponse } from "next/server";

import type { PlatformEvent } from "@slotcity/analytics-schema";
import { createActivityHeaders, getEventsIngestUrl } from "../_lib";

const allowedServerEvents = new Set<PlatformEvent["event"]>([
  "registration_completed",
  "deposit_started",
  "deposit_succeeded",
  "deposit_failed",
  "withdrawal_requested",
  "game_launch_succeeded",
  "game_launch_failed",
  "kyc_verified",
  "kyc_completed",
  "bonus_activated"
]);

function getGeoFromHeaders(headers: Headers) {
  const country =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    undefined;
  const region =
    headers.get("x-vercel-ip-country-region") ??
    headers.get("cf-region") ??
    undefined;
  const city =
    headers.get("x-vercel-ip-city") ??
    headers.get("cf-ipcity") ??
    undefined;

  return {
    country,
    region,
    city
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<PlatformEvent>;
  const ingestUrl = getEventsIngestUrl();

  if (!ingestUrl) {
    return NextResponse.json(
      {
        error: "missing_events_api_url"
      },
      {
        status: 503
      }
    );
  }

  if (!body.event || !allowedServerEvents.has(body.event)) {
    return NextResponse.json(
      {
        error: "unsupported_server_event"
      },
      {
        status: 400
      }
    );
  }

  if (!body.sessionId) {
    return NextResponse.json(
      {
        error: "missing_session_id"
      },
      {
        status: 400
      }
    );
  }

  const payload: PlatformEvent = {
    event: body.event,
    source: "server",
    occurredAt: body.occurredAt ?? new Date().toISOString(),
    sessionId: body.sessionId,
    anonymousId: body.anonymousId,
    userId: body.userId,
    geo: body.geo ?? getGeoFromHeaders(request.headers),
    locale: body.locale,
    deviceType: body.deviceType,
    trafficSource: body.trafficSource,
    campaign: body.campaign,
    bannerId: body.bannerId,
    shelfId: body.shelfId,
    position: body.position,
    gameId: body.gameId,
    providerId: body.providerId,
    experiment: body.experiment,
    variant: body.variant,
    consentState: body.consentState,
    properties: body.properties
  };

  const response = await fetch(ingestUrl, {
    method: "POST",
    headers: createActivityHeaders(),
    body: JSON.stringify(payload)
  });

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json"
    }
  });
}

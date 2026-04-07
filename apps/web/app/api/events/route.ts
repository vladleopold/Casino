import { NextResponse } from "next/server";

import {
  canCaptureFromSource,
  isPlatformEventName,
  type PlatformEvent
} from "@slotcity/analytics-schema";

const EVENTS_API_URL = process.env.EVENTS_API_URL;

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

  if (!body.event || !isPlatformEventName(body.event)) {
    return NextResponse.json(
      {
        error: "unknown_event"
      },
      {
        status: 400
      }
    );
  }

  if (!canCaptureFromSource(body.event, "client")) {
    return NextResponse.json(
      {
        error: "invalid_event_source"
      },
      {
        status: 400
      }
    );
  }

  const payload: PlatformEvent = {
    event: body.event,
    source: "client",
    occurredAt: body.occurredAt ?? new Date().toISOString(),
    sessionId: body.sessionId ?? crypto.randomUUID(),
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

  if (!EVENTS_API_URL) {
    return NextResponse.json({
      accepted: false,
      reason: "missing_events_api_url"
    });
  }

  const response = await fetch(EVENTS_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        accepted: false,
        status: response.status
      },
      {
        status: 502
      }
    );
  }

  return NextResponse.json({
    accepted: true
  });
}

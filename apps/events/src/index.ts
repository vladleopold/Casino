import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";

import {
  canCaptureFromSource,
  isMoneyEventName,
  isPlatformEventName,
  sanitizePlatformEvent,
  type PlatformEvent,
  type PlatformEventName
} from "@slotcity/analytics-schema";

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: true
});

const geoSchema = z
  .object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional()
  })
  .optional();

const eventSchema = z.object({
  event: z.string(),
  source: z.enum(["client", "server"]),
  occurredAt: z.string(),
  sessionId: z.string().min(1),
  anonymousId: z.string().optional(),
  userId: z.string().optional(),
  geo: geoSchema,
  locale: z.string().optional(),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).optional(),
  trafficSource: z.string().optional(),
  campaign: z.string().optional(),
  bannerId: z.string().optional(),
  shelfId: z.string().optional(),
  position: z.number().optional(),
  gameId: z.string().optional(),
  providerId: z.string().optional(),
  experiment: z.string().optional(),
  variant: z.string().optional(),
  consentState: z.enum(["granted", "denied", "pending"]).optional(),
  properties: z.record(z.unknown()).optional()
});

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST ?? "https://us.i.posthog.com";
const BRAZE_REST_API_KEY = process.env.BRAZE_REST_API_KEY;
const BRAZE_ENDPOINT = process.env.BRAZE_ENDPOINT?.replace(/\/$/, "");

function getDistinctId(payload: PlatformEvent) {
  return payload.userId ?? payload.anonymousId ?? payload.sessionId;
}

async function sendToPostHog(payload: PlatformEvent) {
  if (!POSTHOG_API_KEY) {
    return;
  }

  await fetch(`${POSTHOG_HOST}/capture/`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      api_key: POSTHOG_API_KEY,
      event: payload.event,
      distinct_id: getDistinctId(payload),
      properties: {
        source: payload.source,
        session_id: payload.sessionId,
        anonymous_id: payload.anonymousId,
        user_id: payload.userId,
        country: payload.geo?.country,
        region: payload.geo?.region,
        city: payload.geo?.city,
        locale: payload.locale,
        device_type: payload.deviceType,
        traffic_source: payload.trafficSource,
        campaign: payload.campaign,
        banner_id: payload.bannerId,
        shelf_id: payload.shelfId,
        position: payload.position,
        game_id: payload.gameId,
        provider_id: payload.providerId,
        experiment: payload.experiment,
        variant: payload.variant,
        consent_state: payload.consentState,
        ...payload.properties
      },
      timestamp: payload.occurredAt
    })
  });
}

async function sendToBraze(payload: PlatformEvent) {
  if (!BRAZE_REST_API_KEY || !BRAZE_ENDPOINT) {
    return;
  }

  await fetch(`${BRAZE_ENDPOINT}/users/track`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${BRAZE_REST_API_KEY}`
    },
    body: JSON.stringify({
      attributes: payload.userId
        ? [
            {
              external_id: payload.userId,
              country: payload.geo?.country,
              language: payload.locale,
              custom_attributes: {
                traffic_source: payload.trafficSource,
                campaign: payload.campaign,
                last_experiment: payload.experiment,
                last_variant: payload.variant
              }
            }
          ]
        : [],
      events: payload.userId
        ? [
            {
              external_id: payload.userId,
              name: payload.event,
              time: payload.occurredAt,
              properties: {
                source: payload.source,
                session_id: payload.sessionId,
                banner_id: payload.bannerId,
                shelf_id: payload.shelfId,
                game_id: payload.gameId,
                provider_id: payload.providerId,
                campaign: payload.campaign,
                experiment: payload.experiment,
                variant: payload.variant,
                ...payload.properties
              }
            }
          ]
        : []
    })
  });
}

function getValidationError(
  eventName: PlatformEventName,
  payload: PlatformEvent
): string | null {
  if (!canCaptureFromSource(eventName, payload.source)) {
    return `${eventName} must be captured from ${payload.source === "client" ? "server" : "client"} or either.`;
  }

  if (isMoneyEventName(eventName) && payload.source !== "server") {
    return `${eventName} is a money event and must be server-side.`;
  }

  return null;
}

app.get("/health", async () => {
  return {
    status: "ok",
    service: "events"
  };
});

app.post("/events", async (request, reply) => {
  const parsed = eventSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      details: parsed.error.flatten()
    });
  }

  if (!isPlatformEventName(parsed.data.event)) {
    return reply.code(400).send({
      error: "unknown_event"
    });
  }

  const payload: PlatformEvent = {
    ...parsed.data,
    event: parsed.data.event
  };

  const validationError = getValidationError(payload.event, payload);

  if (validationError) {
    return reply.code(400).send({
      error: "invalid_event_source",
      details: validationError
    });
  }

  const sanitizedPayload = sanitizePlatformEvent(payload);

  await Promise.all([sendToPostHog(sanitizedPayload), sendToBraze(sanitizedPayload)]);

  request.log.info(
    {
      event: sanitizedPayload.event,
      source: sanitizedPayload.source,
      sessionId: sanitizedPayload.sessionId,
      userId: sanitizedPayload.userId ?? null
    },
    "Accepted platform event"
  );

  return reply.code(202).send({
    accepted: true
  });
});

const port = Number(process.env.PORT ?? 4000);

try {
  await app.listen({
    host: "0.0.0.0",
    port
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

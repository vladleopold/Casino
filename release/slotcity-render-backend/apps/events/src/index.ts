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
import {
  getActivityUserDetails,
  listActivityUsers,
  recordActivityEvent
} from "./activity-store.js";
import {
  createCredentialUser,
  getStorefrontUserByEmail,
  getStorefrontUserById,
  incrementUserBalance,
  listStorefrontUsers,
  touchUserSeen,
  upsertGoogleUser,
  verifyCredentialUser
} from "./storefront-auth.js";

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
const EVENTS_ACTIVITY_API_KEY = process.env.EVENTS_ACTIVITY_API_KEY;
const AUTH_SERVICE_API_KEY = process.env.AUTH_SERVICE_API_KEY;

const credentialRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(32).optional(),
  displayName: z.string().min(1).max(64).optional()
});

const credentialLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const googleUpsertSchema = z.object({
  email: z.string().email(),
  googleSubject: z.string().min(1),
  displayName: z.string().min(1).max(128).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  emailVerifiedAt: z.string().optional().nullable()
});

const depositSchema = z.object({
  amount: z.number().positive().max(1_000_000)
});

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

function hasActivityAccess(headers: Record<string, unknown>) {
  if (!EVENTS_ACTIVITY_API_KEY) {
    return true;
  }

  return headers["x-activity-key"] === EVENTS_ACTIVITY_API_KEY;
}

function hasAuthServiceAccess(headers: Record<string, unknown>) {
  if (!AUTH_SERVICE_API_KEY) {
    return true;
  }

  return headers["x-auth-service-key"] === AUTH_SERVICE_API_KEY;
}

app.get("/health", async () => {
  return {
    status: "ok",
    service: "events"
  };
});

app.post("/auth/register", async (request, reply) => {
  const parsed = credentialRegisterSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Перевірте email і пароль. Мінімум 8 символів."
    });
  }

  try {
    const user = await createCredentialUser(parsed.data);
    return reply.send({
      ok: true,
      user
    });
  } catch (error) {
    return reply.code(400).send({
      error: "register_failed",
      message:
        error instanceof Error ? error.message : "Не вдалося створити користувача."
    });
  }
});

app.post("/auth/verify-credentials", async (request, reply) => {
  const parsed = credentialLoginSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Перевірте email і пароль."
    });
  }

  const user = await verifyCredentialUser(parsed.data);

  if (!user) {
    return reply.code(401).send({
      error: "invalid_credentials",
      message: "Невірний email або пароль."
    });
  }

  return reply.send({
    ok: true,
    user
  });
});

app.post("/auth/google-upsert", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const parsed = googleUpsertSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Некоректні Google profile дані."
    });
  }

  try {
    const user = await upsertGoogleUser(parsed.data);
    return reply.send({
      ok: true,
      user
    });
  } catch (error) {
    return reply.code(400).send({
      error: "google_upsert_failed",
      message:
        error instanceof Error ? error.message : "Не вдалося синхронізувати Google користувача."
    });
  }
});

app.get("/auth/users", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const query = request.query as {
    limit?: string;
  };

  const users = await listStorefrontUsers(query.limit ? Number(query.limit) : undefined);
  return reply.send({
    users
  });
});

app.get("/auth/users/by-email/:email", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    email: string;
  };
  const user = await getStorefrontUserByEmail(params.email);

  if (!user) {
    return reply.code(404).send({
      error: "user_not_found"
    });
  }

  return reply.send({
    user
  });
});

app.get("/auth/users/:userId", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    userId: string;
  };
  const query = request.query as {
    touch?: string;
  };
  const user = await getStorefrontUserById(params.userId, query.touch === "1");

  if (!user) {
    return reply.code(404).send({
      error: "user_not_found"
    });
  }

  return reply.send({
    user
  });
});

app.post("/auth/users/:userId/touch", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    userId: string;
  };
  const user = await touchUserSeen(params.userId);

  if (!user) {
    return reply.code(404).send({
      error: "user_not_found"
    });
  }

  return reply.send({
    user
  });
});

app.post("/auth/users/:userId/deposit", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    userId: string;
  };
  const parsed = depositSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Некоректна сума поповнення."
    });
  }

  const user = await incrementUserBalance({
    userId: params.userId,
    amount: Math.round(parsed.data.amount)
  });

  if (!user) {
    return reply.code(404).send({
      error: "user_not_found"
    });
  }

  return reply.send({
    ok: true,
    user
  });
});

app.get("/activity/users", async (request, reply) => {
  if (!hasActivityAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const query = request.query as {
    limit?: string;
    query?: string;
  };

  const users = await listActivityUsers({
    limit: query.limit ? Number(query.limit) : undefined,
    query: query.query
  });

  return reply.send({
    users
  });
});

app.get("/activity/users/:userKey", async (request, reply) => {
  if (!hasActivityAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    userKey: string;
  };
  const query = request.query as {
    limit?: string;
  };
  const details = await getActivityUserDetails(
    params.userKey,
    query.limit ? Number(query.limit) : undefined
  );

  if (!details.user) {
    return reply.code(404).send({
      error: "user_not_found"
    });
  }

  return reply.send(details);
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

  await Promise.all([
    sendToPostHog(sanitizedPayload),
    sendToBraze(sanitizedPayload),
    recordActivityEvent(sanitizedPayload)
  ]);

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

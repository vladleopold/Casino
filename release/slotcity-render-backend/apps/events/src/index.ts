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
  approveDepositRequest,
  createCredentialUser,
  createDepositRequest,
  getFinanceAdminUserByEmail,
  getFinanceOverview,
  listFinanceAdminUsers,
  getStorefrontUserByEmail,
  getStorefrontUserFinanceProfile,
  getStorefrontUserById,
  incrementUserBalance,
  listDepositRequests,
  listLedgerEntries,
  listStorefrontUsers,
  manualCreditStorefrontUser,
  rejectDepositRequest,
  touchUserSeen,
  updateStorefrontUserAdminState,
  upsertFinanceAdminUser,
  upsertGoogleUser,
  verifyCredentialUser,
  removeFinanceAdminUser
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

const manualCreditSchema = z.object({
  amount: z.number().positive().max(1_000_000),
  note: z.string().max(500).optional().nullable(),
  createdBy: z.string().min(1).max(128).optional().nullable()
});

const userAdminStateSchema = z.object({
  status: z.enum(["active", "blocked"]).optional(),
  isVip: z.boolean().optional(),
  password: z.string().min(8).max(128).optional().nullable(),
  updatedBy: z.string().min(1).max(128).optional().nullable()
});

const depositRequestSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive().max(1_000_000),
  paymentMethod: z.string().min(2).max(64),
  paymentProvider: z.string().min(2).max(64).optional(),
  payerName: z.string().min(2).max(128).optional(),
  payerEmail: z.string().email().optional(),
  payerPhone: z.string().min(5).max(32).optional(),
  notes: z.string().max(500).optional(),
  idempotencyKey: z.string().min(6).max(128).optional()
});

const approveDepositSchema = z.object({
  approvedBy: z.string().min(1).max(128).optional().nullable()
});

const rejectDepositSchema = z.object({
  rejectedBy: z.string().min(1).max(128).optional().nullable(),
  reason: z.string().min(2).max(500).optional().nullable()
});

const financeAdminUpsertSchema = z.object({
  email: z.string().email(),
  role: z.enum(["super_admin", "admin"]).optional(),
  createdBy: z.string().min(1).max(128).optional().nullable()
});

const financeAdminRemoveSchema = z.object({
  email: z.string().email(),
  removedBy: z.string().min(1).max(128).optional().nullable()
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

app.get("/auth/finance-admin-users", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const admins = await listFinanceAdminUsers();
  return reply.send({
    admins
  });
});

app.get("/auth/finance-admin-users/by-email/:email", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    email: string;
  };
  const admin = await getFinanceAdminUserByEmail(params.email);

  if (!admin) {
    return reply.code(404).send({
      error: "finance_admin_not_found"
    });
  }

  return reply.send({
    admin
  });
});

app.post("/auth/finance-admin-users", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const parsed = financeAdminUpsertSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Некоректна Google-пошта або роль адміністратора."
    });
  }

  try {
    const admin = await upsertFinanceAdminUser(parsed.data);
    return reply.send({
      ok: true,
      admin
    });
  } catch (error) {
    return reply.code(400).send({
      error: "finance_admin_upsert_failed",
      message:
        error instanceof Error ? error.message : "Не вдалося оновити admin allowlist."
    });
  }
});

app.delete("/auth/finance-admin-users", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const parsed = financeAdminRemoveSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Некоректна Google-пошта адміністратора."
    });
  }

  try {
    const admin = await removeFinanceAdminUser(parsed.data);
    return reply.send({
      ok: true,
      admin
    });
  } catch (error) {
    return reply.code(400).send({
      error: "finance_admin_remove_failed",
      message:
        error instanceof Error ? error.message : "Не вдалося видалити Google-пошту з allowlist."
    });
  }
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

app.post("/auth/users/:userId/manual-credit", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    userId: string;
  };
  const parsed = manualCreditSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Некоректна сума або примітка ручного нарахування."
    });
  }

  const user = await manualCreditStorefrontUser({
    userId: params.userId,
    amount: Math.round(parsed.data.amount),
    note: parsed.data.note ?? null,
    createdBy: parsed.data.createdBy ?? null
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

app.post("/auth/users/:userId/admin-state", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    userId: string;
  };
  const parsed = userAdminStateSchema.safeParse(request.body ?? {});

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Некоректні admin-поля користувача."
    });
  }

  try {
    const user = await updateStorefrontUserAdminState({
      userId: params.userId,
      status: parsed.data.status,
      isVip: parsed.data.isVip,
      password: parsed.data.password ?? undefined,
      updatedBy: parsed.data.updatedBy ?? null
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
  } catch (error) {
    return reply.code(400).send({
      error: "user_admin_state_failed",
      message:
        error instanceof Error ? error.message : "Не вдалося оновити стан користувача."
    });
  }
});

app.get("/auth/users/:userId/finance", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    userId: string;
  };
  const profile = await getStorefrontUserFinanceProfile(params.userId);

  if (!profile) {
    return reply.code(404).send({
      error: "user_not_found"
    });
  }

  return reply.send({
    profile
  });
});

app.post("/auth/deposit-requests", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const parsed = depositRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Некоректні дані запиту на поповнення."
    });
  }

  try {
    const depositRequest = await createDepositRequest(parsed.data);
    return reply.send({
      ok: true,
      request: depositRequest
    });
  } catch (error) {
    return reply.code(400).send({
      error: "deposit_request_failed",
      message:
        error instanceof Error ? error.message : "Не вдалося створити заявку на поповнення."
    });
  }
});

app.get("/auth/deposit-requests", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const query = request.query as {
    limit?: string;
    status?: "pending" | "approved" | "rejected" | "cancelled" | "all";
    userId?: string;
  };

  const requests = await listDepositRequests({
    limit: query.limit ? Number(query.limit) : undefined,
    status: query.status,
    userId: query.userId
  });

  return reply.send({
    requests
  });
});

app.post("/auth/deposit-requests/:depositId/approve", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    depositId: string;
  };
  const parsed = approveDepositSchema.safeParse(request.body ?? {});

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Некоректні дані approve-запиту."
    });
  }

  try {
    const result = await approveDepositRequest({
      depositId: params.depositId,
      approvedBy: parsed.data.approvedBy ?? null
    });

    return reply.send({
      ok: true,
      request: result.request,
      user: result.user,
      entry: result.entry
    });
  } catch (error) {
    return reply.code(
      error instanceof Error && error.message === "deposit_not_found" ? 404 : 400
    ).send({
      error: "approve_failed",
      message:
        error instanceof Error ? error.message : "Не вдалося підтвердити поповнення."
    });
  }
});

app.post("/auth/deposit-requests/:depositId/reject", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const params = request.params as {
    depositId: string;
  };
  const parsed = rejectDepositSchema.safeParse(request.body ?? {});

  if (!parsed.success) {
    return reply.code(400).send({
      error: "invalid_payload",
      message: "Некоректні дані reject-запиту."
    });
  }

  try {
    const depositRequest = await rejectDepositRequest({
      depositId: params.depositId,
      rejectedBy: parsed.data.rejectedBy ?? null,
      reason: parsed.data.reason ?? null
    });

    return reply.send({
      ok: true,
      request: depositRequest
    });
  } catch (error) {
    return reply.code(400).send({
      error: "reject_failed",
      message:
        error instanceof Error ? error.message : "Не вдалося відхилити поповнення."
    });
  }
});

app.get("/auth/ledger", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const query = request.query as {
    limit?: string;
    userId?: string;
  };

  const entries = await listLedgerEntries({
    limit: query.limit ? Number(query.limit) : undefined,
    userId: query.userId
  });

  return reply.send({
    entries
  });
});

app.get("/auth/stats", async (request, reply) => {
  if (!hasAuthServiceAccess(request.headers)) {
    return reply.code(401).send({
      error: "unauthorized"
    });
  }

  const overview = await getFinanceOverview();

  return reply.send({
    overview
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

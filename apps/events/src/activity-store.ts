import Redis from "ioredis";

import type { PlatformEvent } from "@slotcity/analytics-schema";

const RECENT_EVENT_LIMIT = 500;
const USER_EVENT_LIMIT = 120;
const USER_SCAN_LIMIT = 200;

export interface ActivityEventRecord {
  id: string;
  userKey: string;
  event: PlatformEvent["event"];
  source: PlatformEvent["source"];
  occurredAt: string;
  userId?: string;
  anonymousId?: string;
  sessionId: string;
  gameId?: string;
  providerId?: string;
  route?: string;
  path?: string;
  label?: string;
  properties?: Record<string, unknown>;
}

export interface ActivityUserSummary {
  userKey: string;
  displayName: string;
  authState: "authenticated" | "anonymous";
  userId?: string;
  anonymousId?: string;
  sessionId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastEvent: PlatformEvent["event"];
  lastPath?: string;
  eventCount: number;
}

export interface ActivityUserDetails {
  user: ActivityUserSummary | null;
  events: ActivityEventRecord[];
}

interface ActivityListOptions {
  limit?: number;
  query?: string;
}

const recentEventsMemory: ActivityEventRecord[] = [];
const userEventsMemory = new Map<string, ActivityEventRecord[]>();
const userSummariesMemory = new Map<string, ActivityUserSummary>();

const redisUrl = process.env.REDIS;
const redis = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false
    })
  : null;

redis?.on("error", (error) => {
  console.error("activity-store redis error", error);
});

function activityUserKey(userKey: string) {
  return `activity:user:${userKey}`;
}

function activityUserSummaryKey(userKey: string) {
  return `activity:user-summary:${userKey}`;
}

function toIsoTimestamp(value: string) {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return new Date().toISOString();
  }

  return timestamp.toISOString();
}

function getUserKey(payload: PlatformEvent) {
  if (payload.userId) {
    return `user:${payload.userId}`;
  }

  if (payload.anonymousId) {
    return `anon:${payload.anonymousId}`;
  }

  return `session:${payload.sessionId}`;
}

function getDisplayName(payload: PlatformEvent) {
  const username = payload.properties?.username;

  if (typeof username === "string" && username.trim().length > 0) {
    return username.trim();
  }

  if (payload.userId) {
    return payload.userId;
  }

  if (payload.anonymousId) {
    return `Anonymous ${payload.anonymousId.slice(0, 8)}`;
  }

  return `Session ${payload.sessionId.slice(0, 8)}`;
}

function getPath(payload: PlatformEvent) {
  const path = payload.properties?.path;

  if (typeof path === "string" && path.trim().length > 0) {
    return path.trim();
  }

  const route = payload.properties?.route;

  if (typeof route === "string" && route.trim().length > 0) {
    return route.trim();
  }

  return undefined;
}

function toEventRecord(payload: PlatformEvent): ActivityEventRecord {
  return {
    id: crypto.randomUUID(),
    userKey: getUserKey(payload),
    event: payload.event,
    source: payload.source,
    occurredAt: toIsoTimestamp(payload.occurredAt),
    userId: payload.userId,
    anonymousId: payload.anonymousId,
    sessionId: payload.sessionId,
    gameId: payload.gameId,
    providerId: payload.providerId,
    route:
      typeof payload.properties?.route === "string" ? payload.properties.route : undefined,
    path: getPath(payload),
    label:
      typeof payload.properties?.label === "string" ? payload.properties.label : undefined,
    properties: payload.properties
  };
}

function mergeSummary(
  existing: ActivityUserSummary | null,
  event: ActivityEventRecord,
  payload: PlatformEvent
): ActivityUserSummary {
  return {
    userKey: event.userKey,
    displayName: getDisplayName(payload),
    authState: payload.userId ? "authenticated" : "anonymous",
    userId: payload.userId,
    anonymousId: payload.anonymousId,
    sessionId: payload.sessionId,
    firstSeenAt: existing?.firstSeenAt ?? event.occurredAt,
    lastSeenAt: event.occurredAt,
    lastEvent: event.event,
    lastPath: event.path,
    eventCount: (existing?.eventCount ?? 0) + 1
  };
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function matchesUserQuery(user: ActivityUserSummary, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    user.userKey,
    user.displayName,
    user.userId,
    user.anonymousId,
    user.sessionId,
    user.lastPath,
    user.lastEvent
  ]
    .filter(Boolean)
    .some((part) => part?.toLowerCase().includes(normalized));
}

async function connectRedis() {
  if (!redis) {
    return null;
  }

  if (redis.status === "wait") {
    await redis.connect();
  }

  return redis;
}

export async function recordActivityEvent(payload: PlatformEvent) {
  const event = toEventRecord(payload);
  const summary = mergeSummary(
    redis
      ? parseJson<ActivityUserSummary>(
          await (await connectRedis())?.get(activityUserSummaryKey(event.userKey)) ?? null
        )
      : userSummariesMemory.get(event.userKey) ?? null,
    event,
    payload
  );

  const client = await connectRedis();

  if (!client) {
    recentEventsMemory.unshift(event);
    recentEventsMemory.splice(RECENT_EVENT_LIMIT);

    const events = userEventsMemory.get(event.userKey) ?? [];
    events.unshift(event);
    events.splice(USER_EVENT_LIMIT);
    userEventsMemory.set(event.userKey, events);
    userSummariesMemory.set(event.userKey, summary);
    return;
  }

  await client
    .multi()
    .lpush("activity:recent", JSON.stringify(event))
    .ltrim("activity:recent", 0, RECENT_EVENT_LIMIT - 1)
    .lpush(activityUserKey(event.userKey), JSON.stringify(event))
    .ltrim(activityUserKey(event.userKey), 0, USER_EVENT_LIMIT - 1)
    .zadd("activity:users:last-seen", Date.parse(event.occurredAt), event.userKey)
    .set(activityUserSummaryKey(event.userKey), JSON.stringify(summary))
    .exec();
}

export async function listActivityUsers(options: ActivityListOptions = {}) {
  const limit = Math.min(Math.max(options.limit ?? 24, 1), 100);
  const query = options.query?.trim() ?? "";
  const client = await connectRedis();

  if (!client) {
    return [...userSummariesMemory.values()]
      .sort((left, right) => Date.parse(right.lastSeenAt) - Date.parse(left.lastSeenAt))
      .filter((user) => matchesUserQuery(user, query))
      .slice(0, limit);
  }

  const userKeys = await client.zrevrange("activity:users:last-seen", 0, USER_SCAN_LIMIT - 1);

  if (userKeys.length === 0) {
    return [];
  }

  const summaries = await client.mget(userKeys.map(activityUserSummaryKey));

  return summaries
    .map((value) => parseJson<ActivityUserSummary>(value))
    .filter((user): user is ActivityUserSummary => Boolean(user))
    .filter((user) => matchesUserQuery(user, query))
    .slice(0, limit);
}

export async function getActivityUserDetails(userKey: string, limit = 60): Promise<ActivityUserDetails> {
  const safeLimit = Math.min(Math.max(limit, 1), 200);
  const client = await connectRedis();

  if (!client) {
    return {
      user: userSummariesMemory.get(userKey) ?? null,
      events: (userEventsMemory.get(userKey) ?? []).slice(0, safeLimit)
    };
  }

  const [summaryRaw, eventRows] = await Promise.all([
    client.get(activityUserSummaryKey(userKey)),
    client.lrange(activityUserKey(userKey), 0, safeLimit - 1)
  ]);

  return {
    user: parseJson<ActivityUserSummary>(summaryRaw),
    events: eventRows
      .map((row) => parseJson<ActivityEventRecord>(row))
      .filter((event): event is ActivityEventRecord => Boolean(event))
  };
}

const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/$/, "");
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
const DIRECTUS_SERVICE_EMAIL = process.env.DIRECTUS_SERVICE_EMAIL;
const DIRECTUS_SERVICE_PASSWORD = process.env.DIRECTUS_SERVICE_PASSWORD;

export interface DirectusUserMirrorRecord {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  authProvider: string;
  balance: number;
  status: string;
  avatarUrl?: string | null;
  googleSubject?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
}

let cachedAccessToken: string | null = null;
let cachedAccessTokenExpiresAt = 0;

function isMirrorConfigured() {
  return Boolean(
    DIRECTUS_URL &&
      (DIRECTUS_TOKEN || (DIRECTUS_SERVICE_EMAIL && DIRECTUS_SERVICE_PASSWORD))
  );
}

async function getAccessToken() {
  if (DIRECTUS_TOKEN) {
    return DIRECTUS_TOKEN;
  }

  if (!DIRECTUS_URL || !DIRECTUS_SERVICE_EMAIL || !DIRECTUS_SERVICE_PASSWORD) {
    return null;
  }

  const now = Date.now();

  if (cachedAccessToken && cachedAccessTokenExpiresAt > now + 15_000) {
    return cachedAccessToken;
  }

  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      email: DIRECTUS_SERVICE_EMAIL,
      password: DIRECTUS_SERVICE_PASSWORD
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Directus login failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as {
    data?: {
      access_token?: string;
      expires?: number;
    };
  };

  const accessToken = payload.data?.access_token;

  if (!accessToken) {
    throw new Error("Directus login did not return an access token.");
  }

  cachedAccessToken = accessToken;
  cachedAccessTokenExpiresAt = now + (payload.data?.expires ?? 900) * 1000;

  return cachedAccessToken;
}

async function directusRequest(path: string, init?: RequestInit) {
  if (!DIRECTUS_URL) {
    throw new Error("DIRECTUS_URL is not configured.");
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Directus service credentials are not configured.");
  }

  return fetch(`${DIRECTUS_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
}

export async function syncUserToDirectusMirror(record: DirectusUserMirrorRecord) {
  if (!isMirrorConfigured()) {
    return false;
  }

  try {
    const lookup = await directusRequest(
      `/items/storefront_users?filter[auth_user_id][_eq]=${encodeURIComponent(
        record.userId
      )}&fields=id`
    );

    if (!lookup.ok) {
      throw new Error(`Directus lookup failed: ${lookup.status} ${lookup.statusText}`);
    }

    const existing = (await lookup.json()) as {
      data?: Array<{ id: number | string }>;
    };

    const body = JSON.stringify({
      auth_user_id: record.userId,
      email: record.email,
      username: record.username,
      display_name: record.displayName,
      auth_provider: record.authProvider,
      balance: record.balance,
      status: record.status,
      avatar_url: record.avatarUrl ?? null,
      google_subject: record.googleSubject ?? null,
      email_verified_at: record.emailVerifiedAt ?? null,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
      last_login_at: record.lastLoginAt ?? null,
      last_seen_at: record.lastSeenAt ?? null
    });

    const existingId = existing.data?.[0]?.id;

    const response = await directusRequest(
      existingId ? `/items/storefront_users/${existingId}` : "/items/storefront_users",
      {
        method: existingId ? "PATCH" : "POST",
        body
      }
    );

    if (!response.ok) {
      throw new Error(`Directus upsert failed: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to sync user to Directus mirror.", error);
    return false;
  }
}

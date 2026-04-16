import type { StorefrontUser } from "./store-users";

const AUTH_API_URL = process.env.AUTH_API_URL?.replace(/\/$/, "");
const AUTH_SERVICE_API_KEY = process.env.AUTH_SERVICE_API_KEY;

interface RequestOptions {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  service?: boolean;
}

function requireAuthApiUrl() {
  if (!AUTH_API_URL) {
    throw new Error("AUTH_API_URL is not configured.");
  }

  return AUTH_API_URL;
}

async function authRequest<T>(path: string, options: RequestOptions = {}) {
  const baseUrl = requireAuthApiUrl();
  const headers: Record<string, string> = {};

  if (options.body) {
    headers["content-type"] = "application/json";
  }

  if (options.service && AUTH_SERVICE_API_KEY) {
    headers["x-auth-service-key"] = AUTH_SERVICE_API_KEY;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        error?: string;
        message?: string;
        user?: StorefrontUser | null;
        users?: StorefrontUser[];
      }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? payload?.error ?? "Auth service request failed.");
  }

  return payload as T;
}

export function isRemoteAuthConfigured() {
  return Boolean(AUTH_API_URL);
}

export async function getRemoteStorefrontUserById(userId: string) {
  const payload = await authRequest<{ user?: StorefrontUser | null }>(
    `/users/${encodeURIComponent(userId)}?touch=1`,
    {
      service: true
    }
  );

  return payload.user ?? null;
}

export async function getRemoteStorefrontUserByEmail(email: string) {
  const payload = await authRequest<{ user?: StorefrontUser | null }>(
    `/users/by-email/${encodeURIComponent(email)}`,
    {
      service: true
    }
  );

  return payload.user ?? null;
}

export async function listRemoteStorefrontUsers(limit = 100) {
  const payload = await authRequest<{ users?: StorefrontUser[] }>(`/users?limit=${limit}`, {
    service: true
  });

  return payload.users ?? [];
}

export async function createRemoteCredentialUser(input: {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}) {
  const payload = await authRequest<{ user?: StorefrontUser | null }>("/register", {
    method: "POST",
    body: input
  });

  if (!payload.user) {
    throw new Error("Auth service did not return a user.");
  }

  return payload.user;
}

export async function verifyRemoteCredentialUser(input: { email: string; password: string }) {
  const payload = await authRequest<{ user?: StorefrontUser | null }>("/verify-credentials", {
    method: "POST",
    body: input
  });

  return payload.user ?? null;
}

export async function upsertRemoteGoogleUser(input: {
  email: string;
  googleSubject: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  emailVerifiedAt?: string | null;
}) {
  const payload = await authRequest<{ user?: StorefrontUser | null }>("/google-upsert", {
    method: "POST",
    body: input,
    service: true
  });

  if (!payload.user) {
    throw new Error("Auth service did not return a user.");
  }

  return payload.user;
}

export async function incrementRemoteUserBalance(input: { userId: string; amount: number }) {
  const payload = await authRequest<{ user?: StorefrontUser | null }>(
    `/users/${encodeURIComponent(input.userId)}/deposit`,
    {
      method: "POST",
      body: {
        amount: input.amount
      },
      service: true
    }
  );

  return payload.user ?? null;
}

export async function touchRemoteUserSeen(userId: string) {
  const payload = await authRequest<{ user?: StorefrontUser | null }>(
    `/users/${encodeURIComponent(userId)}/touch`,
    {
      method: "POST",
      service: true
    }
  );

  return payload.user ?? null;
}

import type {
  StorefrontDepositRequest,
  StorefrontFinanceOverview,
  StorefrontLedgerEntry,
  StorefrontUser,
  StorefrontUserFinanceProfile
} from "./store-users";

const AUTH_API_URL = process.env.AUTH_API_URL?.trim().replace(/\/$/, "");
const AUTH_SERVICE_API_KEY = process.env.AUTH_SERVICE_API_KEY?.trim();

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

export async function createRemoteDepositRequest(input: {
  userId: string;
  amount: number;
  paymentMethod: string;
  paymentProvider?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  notes?: string;
  idempotencyKey?: string;
}) {
  const payload = await authRequest<{ request?: StorefrontDepositRequest | null }>(
    "/deposit-requests",
    {
      method: "POST",
      body: input,
      service: true
    }
  );

  if (!payload.request) {
    throw new Error("Auth service did not return a deposit request.");
  }

  return payload.request;
}

export async function listRemoteDepositRequestsForAdmin(input?: {
  limit?: number;
  status?: StorefrontDepositRequest["status"] | "all";
  userId?: string;
}) {
  const params = new URLSearchParams();

  if (input?.limit) {
    params.set("limit", String(input.limit));
  }

  if (input?.status) {
    params.set("status", input.status);
  }

  if (input?.userId) {
    params.set("userId", input.userId);
  }

  const payload = await authRequest<{ requests?: StorefrontDepositRequest[] }>(
    `/deposit-requests?${params.toString()}`,
    {
      service: true
    }
  );

  return payload.requests ?? [];
}

export async function listRemoteLedgerEntriesForAdmin(input?: {
  limit?: number;
  userId?: string;
}) {
  const params = new URLSearchParams();

  if (input?.limit) {
    params.set("limit", String(input.limit));
  }

  if (input?.userId) {
    params.set("userId", input.userId);
  }

  const payload = await authRequest<{ entries?: StorefrontLedgerEntry[] }>(
    `/ledger?${params.toString()}`,
    {
      service: true
    }
  );

  return payload.entries ?? [];
}

export async function approveRemoteDepositRequest(input: {
  depositId: string;
  approvedBy?: string | null;
}) {
  const payload = await authRequest<{
    request?: StorefrontDepositRequest | null;
    user?: StorefrontUser | null;
    entry?: StorefrontLedgerEntry | null;
  }>(`/deposit-requests/${encodeURIComponent(input.depositId)}/approve`, {
    method: "POST",
    body: {
      approvedBy: input.approvedBy ?? null
    },
    service: true
  });

  return {
    request: payload.request ?? null,
    user: payload.user ?? null,
    entry: payload.entry ?? null
  };
}

export async function rejectRemoteDepositRequest(input: {
  depositId: string;
  rejectedBy?: string | null;
  reason?: string | null;
}) {
  const payload = await authRequest<{ request?: StorefrontDepositRequest | null }>(
    `/deposit-requests/${encodeURIComponent(input.depositId)}/reject`,
    {
      method: "POST",
      body: {
        rejectedBy: input.rejectedBy ?? null,
        reason: input.reason ?? null
      },
      service: true
    }
  );

  if (!payload.request) {
    throw new Error("Auth service did not return a deposit request.");
  }

  return payload.request;
}

export async function getRemoteFinanceOverview() {
  const payload = await authRequest<{ overview?: StorefrontFinanceOverview | null }>("/stats", {
    service: true
  });

  if (!payload.overview) {
    throw new Error("Auth service did not return finance overview.");
  }

  return payload.overview;
}

export async function getRemoteStorefrontUserFinanceProfile(userId: string) {
  const payload = await authRequest<{ profile?: StorefrontUserFinanceProfile | null }>(
    `/users/${encodeURIComponent(userId)}/finance`,
    {
      service: true
    }
  );

  return payload.profile ?? null;
}

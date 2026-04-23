import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

import { syncUserToDirectusMirror } from "./directus-user-mirror.js";

export interface StorefrontUser {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  authProvider: string;
  balance: number;
  status: "active";
  avatarUrl?: string | null;
  googleSubject?: string | null;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
}

interface StorefrontUserRow {
  user_id: string;
  email: string;
  username: string;
  display_name: string | null;
  auth_provider: string;
  password_hash: string | null;
  google_subject: string | null;
  balance: number;
  status: "active";
  avatar_url: string | null;
  email_verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
  last_seen_at: Date | null;
}

interface StorefrontLedgerEntryRow {
  entry_id: string;
  user_id: string;
  entry_type: string;
  direction: "credit" | "debit";
  status: "posted" | "reversed";
  amount: number;
  currency: string;
  balance_before: number;
  balance_after: number;
  reference_id: string | null;
  source: string;
  payment_method: string | null;
  payment_provider: string | null;
  description: string | null;
  meta: Record<string, unknown> | null;
  created_by: string | null;
  created_at: Date;
}

interface StorefrontDepositRequestRow {
  deposit_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  payment_method: string;
  payment_provider: string;
  payer_name: string | null;
  payer_email: string | null;
  payer_phone: string | null;
  notes: string | null;
  idempotency_key: string;
  approved_ledger_entry_id: string | null;
  approved_by: string | null;
  approved_at: Date | null;
  rejected_by: string | null;
  rejected_at: Date | null;
  rejected_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface StorefrontLedgerEntry {
  entryId: string;
  userId: string;
  entryType: string;
  direction: "credit" | "debit";
  status: "posted" | "reversed";
  amount: number;
  currency: string;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string | null;
  source: string;
  paymentMethod?: string | null;
  paymentProvider?: string | null;
  description?: string | null;
  meta?: Record<string, unknown> | null;
  createdBy?: string | null;
  createdAt: string;
}

export interface StorefrontDepositRequest {
  depositId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  paymentMethod: string;
  paymentProvider: string;
  payerName?: string | null;
  payerEmail?: string | null;
  payerPhone?: string | null;
  notes?: string | null;
  idempotencyKey: string;
  approvedLedgerEntryId?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontFinanceOverview {
  userCount: number;
  totalBalances: number;
  pendingDepositsAmount: number;
  approvedDepositsAmount: number;
  approvedDepositsCount: number;
  pendingDepositsCount: number;
  rejectedDepositsCount: number;
}

export interface StorefrontUserFinanceProfile {
  user: StorefrontUser;
  approvedDepositsAmount: number;
  approvedDepositsCount: number;
  pendingDepositsAmount: number;
  pendingDepositsCount: number;
  recentDeposits: StorefrontDepositRequest[];
  recentLedger: StorefrontLedgerEntry[];
}

interface FinanceAdminUserRow {
  admin_id: string;
  email: string;
  role: "super_admin" | "admin";
  status: "active";
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface FinanceAdminUser {
  adminId: string;
  email: string;
  role: "super_admin" | "admin";
  status: "active";
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

const STORE_DB_URL = process.env.STORE_DB_URL;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DEFAULT_FINANCE_SUPER_ADMIN_EMAIL = normalizeEmail(
  process.env.FINANCE_SUPER_ADMIN_EMAIL ?? "vladyslavchaplygin@gmail.com"
);
const SALT_ROUNDS = 12;
const MAX_LIST_LIMIT = 250;
const DEFAULT_CURRENCY = "UAH";
const DEFAULT_PAYMENT_PROVIDER = "manual-review";

declare global {
  // eslint-disable-next-line no-var
  var __slotcityEventsAuthPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __slotcityEventsAuthSchemaInit: Promise<void> | undefined;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function slugifyUsername(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || `slotcity_${randomUUID().slice(0, 8)}`;
}

function deriveUsernameFromEmail(email: string) {
  return slugifyUsername(email.split("@")[0] || "slotcity_user");
}

function toIsoString(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapUser(row: StorefrontUserRow): StorefrontUser {
  return {
    userId: row.user_id,
    email: row.email,
    username: row.username,
    displayName: row.display_name || row.username,
    authProvider: row.auth_provider,
    balance: Number(row.balance) || 0,
    status: row.status,
    avatarUrl: row.avatar_url,
    googleSubject: row.google_subject,
    emailVerifiedAt: toIsoString(row.email_verified_at),
    createdAt: toIsoString(row.created_at) || new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) || new Date().toISOString(),
    lastLoginAt: toIsoString(row.last_login_at),
    lastSeenAt: toIsoString(row.last_seen_at)
  };
}

function mapLedgerEntry(row: StorefrontLedgerEntryRow): StorefrontLedgerEntry {
  return {
    entryId: row.entry_id,
    userId: row.user_id,
    entryType: row.entry_type,
    direction: row.direction,
    status: row.status,
    amount: Number(row.amount) || 0,
    currency: row.currency,
    balanceBefore: Number(row.balance_before) || 0,
    balanceAfter: Number(row.balance_after) || 0,
    referenceId: row.reference_id,
    source: row.source,
    paymentMethod: row.payment_method,
    paymentProvider: row.payment_provider,
    description: row.description,
    meta: row.meta ?? null,
    createdBy: row.created_by,
    createdAt: toIsoString(row.created_at) || new Date().toISOString()
  };
}

function mapDepositRequest(row: StorefrontDepositRequestRow): StorefrontDepositRequest {
  return {
    depositId: row.deposit_id,
    userId: row.user_id,
    amount: Number(row.amount) || 0,
    currency: row.currency,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentProvider: row.payment_provider,
    payerName: row.payer_name,
    payerEmail: row.payer_email,
    payerPhone: row.payer_phone,
    notes: row.notes,
    idempotencyKey: row.idempotency_key,
    approvedLedgerEntryId: row.approved_ledger_entry_id,
    approvedBy: row.approved_by,
    approvedAt: toIsoString(row.approved_at),
    rejectedBy: row.rejected_by,
    rejectedAt: toIsoString(row.rejected_at),
    rejectedReason: row.rejected_reason,
    createdAt: toIsoString(row.created_at) || new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) || new Date().toISOString()
  };
}

function mapFinanceAdminUser(row: FinanceAdminUserRow): FinanceAdminUser {
  return {
    adminId: row.admin_id,
    email: row.email,
    role: row.role,
    status: row.status,
    createdBy: row.created_by,
    createdAt: toIsoString(row.created_at) || new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) || new Date().toISOString()
  };
}

function isUniqueViolation(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
  );
}

function clampListLimit(limit = 50) {
  return Math.max(1, Math.min(MAX_LIST_LIMIT, Math.trunc(limit || 50)));
}

function buildId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 22)}`;
}

function getPool() {
  if (!globalThis.__slotcityEventsAuthPool) {
    if (STORE_DB_URL) {
      globalThis.__slotcityEventsAuthPool = new Pool({
        connectionString: STORE_DB_URL,
        ssl:
          STORE_DB_URL.includes("render.com") || STORE_DB_URL.includes("neon.tech")
            ? { rejectUnauthorized: false }
            : undefined
      });
    } else if (DB_HOST && DB_PORT && DB_DATABASE && DB_USER && DB_PASSWORD) {
      globalThis.__slotcityEventsAuthPool = new Pool({
        host: DB_HOST,
        port: Number(DB_PORT),
        database: DB_DATABASE,
        user: DB_USER,
        password: DB_PASSWORD,
        ssl: DB_HOST.includes("render.com") ? { rejectUnauthorized: false } : undefined
      });
    } else {
      throw new Error("Storefront auth database is not configured.");
    }
  }

  return globalThis.__slotcityEventsAuthPool;
}

async function ensureSchema() {
  if (!globalThis.__slotcityEventsAuthSchemaInit) {
    globalThis.__slotcityEventsAuthSchemaInit = (async () => {
      const pool = getPool();

      await pool.query(`
        CREATE TABLE IF NOT EXISTS storefront_auth_users (
          user_id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL,
          display_name TEXT,
          auth_provider TEXT NOT NULL DEFAULT 'credentials',
          password_hash TEXT,
          google_subject TEXT UNIQUE,
          balance INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'active',
          avatar_url TEXT,
          email_verified_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login_at TIMESTAMPTZ,
          last_seen_at TIMESTAMPTZ
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS storefront_auth_users_created_at_idx
          ON storefront_auth_users (created_at DESC);
      `);

      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS storefront_auth_users_google_subject_uidx
          ON storefront_auth_users (google_subject)
          WHERE google_subject IS NOT NULL;
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS storefront_balance_ledger (
          entry_id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES storefront_auth_users (user_id) ON DELETE CASCADE,
          entry_type TEXT NOT NULL,
          direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
          status TEXT NOT NULL DEFAULT 'posted',
          amount INTEGER NOT NULL CHECK (amount > 0),
          currency TEXT NOT NULL DEFAULT 'UAH',
          balance_before INTEGER NOT NULL,
          balance_after INTEGER NOT NULL,
          reference_id TEXT,
          source TEXT NOT NULL DEFAULT 'system',
          payment_method TEXT,
          payment_provider TEXT,
          description TEXT,
          meta JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_by TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS storefront_balance_ledger_user_created_idx
          ON storefront_balance_ledger (user_id, created_at DESC);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS storefront_balance_ledger_reference_idx
          ON storefront_balance_ledger (reference_id);
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS storefront_deposit_requests (
          deposit_id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES storefront_auth_users (user_id) ON DELETE CASCADE,
          amount INTEGER NOT NULL CHECK (amount > 0),
          currency TEXT NOT NULL DEFAULT 'UAH',
          status TEXT NOT NULL DEFAULT 'pending',
          payment_method TEXT NOT NULL,
          payment_provider TEXT NOT NULL,
          payer_name TEXT,
          payer_email TEXT,
          payer_phone TEXT,
          notes TEXT,
          idempotency_key TEXT NOT NULL UNIQUE,
          approved_ledger_entry_id TEXT REFERENCES storefront_balance_ledger (entry_id),
          approved_by TEXT,
          approved_at TIMESTAMPTZ,
          rejected_by TEXT,
          rejected_at TIMESTAMPTZ,
          rejected_reason TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS storefront_deposit_requests_user_created_idx
          ON storefront_deposit_requests (user_id, created_at DESC);
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS storefront_deposit_requests_status_created_idx
          ON storefront_deposit_requests (status, created_at DESC);
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS storefront_finance_admin_users (
          admin_id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL DEFAULT 'admin',
          status TEXT NOT NULL DEFAULT 'active',
          created_by TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS storefront_finance_admin_users_role_idx
          ON storefront_finance_admin_users (role, created_at DESC);
      `);

      await pool.query(
        `
          INSERT INTO storefront_finance_admin_users (
            admin_id,
            email,
            role,
            status,
            created_by,
            created_at,
            updated_at
          )
          VALUES ($1, $2, 'super_admin', 'active', 'system', NOW(), NOW())
          ON CONFLICT (email)
          DO UPDATE SET
            role = 'super_admin',
            status = 'active',
            updated_at = NOW()
        `,
        [buildId("fadm"), DEFAULT_FINANCE_SUPER_ADMIN_EMAIL]
      );
    })();
  }

  await globalThis.__slotcityEventsAuthSchemaInit;
}

async function syncMirror(user: StorefrontUser) {
  await syncUserToDirectusMirror(user);
}

async function queryUserBySql(query: string, params: unknown[]) {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<StorefrontUserRow>(query, params);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

async function queryRowBySql<T extends QueryResultRow>(query: string, params: unknown[]) {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<T>(query, params);
  return result.rows[0] ?? null;
}

async function queryRowsBySql<T extends QueryResultRow>(query: string, params: unknown[]) {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<T>(query, params);
  return result.rows;
}

async function getLockedUserRow(client: PoolClient, userId: string) {
  const result = await client.query<StorefrontUserRow>(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE user_id = $1
      LIMIT 1
      FOR UPDATE
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

async function writeLedgerEntry(
  client: PoolClient,
  input: {
    userId: string;
    amount: number;
    direction: "credit" | "debit";
    entryType: string;
    source: string;
    referenceId?: string | null;
    paymentMethod?: string | null;
    paymentProvider?: string | null;
    description?: string | null;
    meta?: Record<string, unknown>;
    createdBy?: string | null;
  }
) {
  const userRow = await getLockedUserRow(client, input.userId);

  if (!userRow) {
    throw new Error("user_not_found");
  }

  const balanceBefore = Number(userRow.balance) || 0;
  const signedDelta = input.direction === "credit" ? input.amount : -input.amount;
  const balanceAfter = balanceBefore + signedDelta;

  if (balanceAfter < 0) {
    throw new Error("insufficient_funds");
  }

  const entryId = buildId("led");

  const entryResult = await client.query<StorefrontLedgerEntryRow>(
    `
      INSERT INTO storefront_balance_ledger (
        entry_id,
        user_id,
        entry_type,
        direction,
        status,
        amount,
        currency,
        balance_before,
        balance_after,
        reference_id,
        source,
        payment_method,
        payment_provider,
        description,
        meta,
        created_by,
        created_at
      )
      VALUES (
        $1, $2, $3, $4, 'posted', $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15, NOW()
      )
      RETURNING *
    `,
    [
      entryId,
      input.userId,
      input.entryType,
      input.direction,
      input.amount,
      DEFAULT_CURRENCY,
      balanceBefore,
      balanceAfter,
      input.referenceId ?? null,
      input.source,
      input.paymentMethod ?? null,
      input.paymentProvider ?? null,
      input.description ?? null,
      JSON.stringify(input.meta ?? {}),
      input.createdBy ?? null
    ]
  );

  const userResult = await client.query<StorefrontUserRow>(
    `
      UPDATE storefront_auth_users
      SET balance = $2,
          last_seen_at = NOW(),
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `,
    [input.userId, balanceAfter]
  );

  return {
    entry: mapLedgerEntry(entryResult.rows[0]),
    user: mapUser(userResult.rows[0])
  };
}

export function isStorefrontAuthConfigured() {
  return Boolean(
    STORE_DB_URL || (DB_HOST && DB_PORT && DB_DATABASE && DB_USER && DB_PASSWORD)
  );
}

export async function getStorefrontUserById(userId: string, touch = false) {
  const user = await queryUserBySql(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  if (!user || !touch) {
    return user;
  }

  return touchUserSeen(userId);
}

export async function getStorefrontUserByEmail(email: string) {
  return queryUserBySql(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizeEmail(email)]
  );
}

export async function listStorefrontUsers(limit = 100) {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<StorefrontUserRow>(
    `
      SELECT *
      FROM storefront_auth_users
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [clampListLimit(limit)]
  );

  return result.rows.map(mapUser);
}

export async function listFinanceAdminUsers() {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<FinanceAdminUserRow>(
    `
      SELECT *
      FROM storefront_finance_admin_users
      WHERE status = 'active'
      ORDER BY
        CASE WHEN role = 'super_admin' THEN 0 ELSE 1 END,
        created_at ASC
    `
  );

  return result.rows.map(mapFinanceAdminUser);
}

export async function getFinanceAdminUserByEmail(email: string) {
  const row = await queryRowBySql<FinanceAdminUserRow>(
    `
      SELECT *
      FROM storefront_finance_admin_users
      WHERE email = $1
        AND status = 'active'
      LIMIT 1
    `,
    [normalizeEmail(email)]
  );

  return row ? mapFinanceAdminUser(row) : null;
}

export async function upsertFinanceAdminUser(input: {
  email: string;
  role?: FinanceAdminUser["role"];
  createdBy?: string | null;
}) {
  await ensureSchema();
  const pool = getPool();
  const normalizedEmail = normalizeEmail(input.email);
  const role = input.role ?? "admin";

  const result = await pool.query<FinanceAdminUserRow>(
    `
      INSERT INTO storefront_finance_admin_users (
        admin_id,
        email,
        role,
        status,
        created_by,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, 'active', $4, NOW(), NOW())
      ON CONFLICT (email)
      DO UPDATE SET
        role = EXCLUDED.role,
        status = 'active',
        created_by = COALESCE(storefront_finance_admin_users.created_by, EXCLUDED.created_by),
        updated_at = NOW()
      RETURNING *
    `,
    [buildId("fadm"), normalizedEmail, role, input.createdBy ?? null]
  );

  return mapFinanceAdminUser(result.rows[0]);
}

export async function removeFinanceAdminUser(input: {
  email: string;
  removedBy?: string | null;
}) {
  await ensureSchema();
  const pool = getPool();
  const normalizedEmail = normalizeEmail(input.email);

  if (normalizedEmail === DEFAULT_FINANCE_SUPER_ADMIN_EMAIL) {
    throw new Error("default_super_admin_protected");
  }

  const result = await pool.query<FinanceAdminUserRow>(
    `
      DELETE FROM storefront_finance_admin_users
      WHERE email = $1
        AND status = 'active'
      RETURNING *
    `,
    [normalizedEmail]
  );

  if (!result.rows[0]) {
    throw new Error("finance_admin_not_found");
  }

  return mapFinanceAdminUser(result.rows[0]);
}

export async function createCredentialUser(input: {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}) {
  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(input.email);
  const username = slugifyUsername(input.username || deriveUsernameFromEmail(email));
  const displayName = input.displayName?.trim() || username;
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const result = await pool.query<StorefrontUserRow>(
      `
        INSERT INTO storefront_auth_users (
          user_id,
          email,
          username,
          display_name,
          auth_provider,
          password_hash,
          created_at,
          updated_at,
          last_login_at,
          last_seen_at
        )
        VALUES ($1, $2, $3, $4, 'credentials', $5, NOW(), NOW(), NOW(), NOW())
        RETURNING *
      `,
      [
        `sc_${randomUUID().replace(/-/g, "").slice(0, 18)}`,
        email,
        username,
        displayName,
        passwordHash
      ]
    );

    const user = mapUser(result.rows[0]);
    await syncMirror(user);
    return user;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("Користувач з таким email вже існує.");
    }

    throw error;
  }
}

export async function verifyCredentialUser(input: { email: string; password: string }) {
  const row = await queryRowBySql<StorefrontUserRow>(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizeEmail(input.email)]
  );

  if (!row?.password_hash) {
    return null;
  }

  const isValid = await bcrypt.compare(input.password, row.password_hash);

  if (!isValid) {
    return null;
  }

  const pool = getPool();
  const updated = await pool.query<StorefrontUserRow>(
    `
      UPDATE storefront_auth_users
      SET last_login_at = NOW(),
          last_seen_at = NOW(),
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `,
    [row.user_id]
  );

  const user = mapUser(updated.rows[0]);
  await syncMirror(user);
  return user;
}

export async function upsertGoogleUser(input: {
  email: string;
  googleSubject: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  emailVerifiedAt?: string | null;
}) {
  await ensureSchema();
  const pool = getPool();
  const email = normalizeEmail(input.email);
  const displayName = input.displayName?.trim() || deriveUsernameFromEmail(email);
  const avatarUrl = input.avatarUrl?.trim() || null;
  const emailVerifiedAt = input.emailVerifiedAt ?? new Date().toISOString();

  const byGoogle = await queryRowBySql<StorefrontUserRow>(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE google_subject = $1
      LIMIT 1
    `,
    [input.googleSubject]
  );

  if (byGoogle) {
    const updated = await pool.query<StorefrontUserRow>(
      `
        UPDATE storefront_auth_users
        SET email = $2,
            display_name = $3,
            avatar_url = $4,
            auth_provider = CASE
              WHEN auth_provider = 'credentials' THEN 'credentials+google'
              ELSE auth_provider
            END,
            email_verified_at = COALESCE($5::timestamptz, email_verified_at, NOW()),
            last_login_at = NOW(),
            last_seen_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `,
      [byGoogle.user_id, email, displayName, avatarUrl, emailVerifiedAt]
    );

    const user = mapUser(updated.rows[0]);
    await syncMirror(user);
    return user;
  }

  const byEmail = await queryRowBySql<StorefrontUserRow>(
    `
      SELECT *
      FROM storefront_auth_users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  if (byEmail) {
    const updated = await pool.query<StorefrontUserRow>(
      `
        UPDATE storefront_auth_users
        SET google_subject = $2,
            display_name = COALESCE(display_name, $3),
            avatar_url = COALESCE($4, avatar_url),
            auth_provider = CASE
              WHEN auth_provider = 'credentials' THEN 'credentials+google'
              ELSE 'google'
            END,
            email_verified_at = COALESCE($5::timestamptz, email_verified_at, NOW()),
            last_login_at = NOW(),
            last_seen_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `,
      [byEmail.user_id, input.googleSubject, displayName, avatarUrl, emailVerifiedAt]
    );

    const user = mapUser(updated.rows[0]);
    await syncMirror(user);
    return user;
  }

  const inserted = await pool.query<StorefrontUserRow>(
    `
      INSERT INTO storefront_auth_users (
        user_id,
        email,
        username,
        display_name,
        auth_provider,
        google_subject,
        avatar_url,
        email_verified_at,
        created_at,
        updated_at,
        last_login_at,
        last_seen_at
      )
      VALUES ($1, $2, $3, $4, 'google', $5, $6, $7::timestamptz, NOW(), NOW(), NOW(), NOW())
      RETURNING *
    `,
    [
      `sc_${randomUUID().replace(/-/g, "").slice(0, 18)}`,
      email,
      deriveUsernameFromEmail(email),
      displayName,
      input.googleSubject,
      avatarUrl,
      emailVerifiedAt
    ]
  );

  const user = mapUser(inserted.rows[0]);
  await syncMirror(user);
  return user;
}

export async function incrementUserBalance(input: { userId: string; amount: number }) {
  await ensureSchema();
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { user } = await writeLedgerEntry(client, {
      userId: input.userId,
      amount: Math.round(input.amount),
      direction: "credit",
      entryType: "operator_credit",
      source: "operator",
      description: "Legacy balance adjustment"
    });
    await client.query("COMMIT");
    await syncMirror(user);
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof Error && error.message === "user_not_found") {
      return null;
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function createDepositRequest(input: {
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
  await ensureSchema();
  const pool = getPool();
  const depositId = buildId("dep");
  const idempotencyKey = normalizeOptionalText(input.idempotencyKey) ?? buildId("idem");
  const payerEmail = normalizeOptionalText(input.payerEmail)
    ? normalizeEmail(input.payerEmail as string)
    : null;

  const result = await pool.query<StorefrontDepositRequestRow>(
    `
      INSERT INTO storefront_deposit_requests (
        deposit_id,
        user_id,
        amount,
        currency,
        status,
        payment_method,
        payment_provider,
        payer_name,
        payer_email,
        payer_phone,
        notes,
        idempotency_key,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      )
      RETURNING *
    `,
    [
      depositId,
      input.userId,
      Math.round(input.amount),
      DEFAULT_CURRENCY,
      normalizeOptionalText(input.paymentMethod) ?? "card",
      normalizeOptionalText(input.paymentProvider) ?? DEFAULT_PAYMENT_PROVIDER,
      normalizeOptionalText(input.payerName),
      payerEmail,
      normalizeOptionalText(input.payerPhone),
      normalizeOptionalText(input.notes),
      idempotencyKey
    ]
  );

  return mapDepositRequest(result.rows[0]);
}

export async function listDepositRequests(input?: {
  limit?: number;
  status?: StorefrontDepositRequest["status"] | "all";
  userId?: string;
}) {
  const limit = clampListLimit(input?.limit ?? 80);
  const filters: string[] = [];
  const params: unknown[] = [];

  if (input?.status && input.status !== "all") {
    params.push(input.status);
    filters.push(`status = $${params.length}`);
  }

  if (input?.userId) {
    params.push(input.userId);
    filters.push(`user_id = $${params.length}`);
  }

  params.push(limit);

  const rows = await queryRowsBySql<StorefrontDepositRequestRow>(
    `
      SELECT *
      FROM storefront_deposit_requests
      ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
      ORDER BY created_at DESC
      LIMIT $${params.length}
    `,
    params
  );

  return rows.map(mapDepositRequest);
}

export async function listLedgerEntries(input?: {
  limit?: number;
  userId?: string;
}) {
  const limit = clampListLimit(input?.limit ?? 120);
  const params: unknown[] = [];
  const filters: string[] = [];

  if (input?.userId) {
    params.push(input.userId);
    filters.push(`user_id = $${params.length}`);
  }

  params.push(limit);

  const rows = await queryRowsBySql<StorefrontLedgerEntryRow>(
    `
      SELECT *
      FROM storefront_balance_ledger
      ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
      ORDER BY created_at DESC
      LIMIT $${params.length}
    `,
    params
  );

  return rows.map(mapLedgerEntry);
}

export async function approveDepositRequest(input: {
  depositId: string;
  approvedBy?: string | null;
}) {
  await ensureSchema();
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const depositResult = await client.query<StorefrontDepositRequestRow>(
      `
        SELECT *
        FROM storefront_deposit_requests
        WHERE deposit_id = $1
        LIMIT 1
        FOR UPDATE
      `,
      [input.depositId]
    );

    const request = depositResult.rows[0];

    if (!request) {
      throw new Error("deposit_not_found");
    }

    if (request.status !== "pending") {
      throw new Error("deposit_not_pending");
    }

    const { entry, user } = await writeLedgerEntry(client, {
      userId: request.user_id,
      amount: Number(request.amount) || 0,
      direction: "credit",
      entryType: "deposit",
      source: "payment",
      referenceId: request.deposit_id,
      paymentMethod: request.payment_method,
      paymentProvider: request.payment_provider,
      description: "Approved deposit request",
      meta: {
        depositId: request.deposit_id,
        payerEmail: request.payer_email,
        payerPhone: request.payer_phone
      },
      createdBy: input.approvedBy ?? null
    });

    const updatedRequest = await client.query<StorefrontDepositRequestRow>(
      `
        UPDATE storefront_deposit_requests
        SET status = 'approved',
            approved_ledger_entry_id = $2,
            approved_by = $3,
            approved_at = NOW(),
            updated_at = NOW()
        WHERE deposit_id = $1
        RETURNING *
      `,
      [request.deposit_id, entry.entryId, input.approvedBy ?? null]
    );

    await client.query("COMMIT");
    await syncMirror(user);

    return {
      request: mapDepositRequest(updatedRequest.rows[0]),
      user,
      entry
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function rejectDepositRequest(input: {
  depositId: string;
  rejectedBy?: string | null;
  reason?: string | null;
}) {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<StorefrontDepositRequestRow>(
    `
      UPDATE storefront_deposit_requests
      SET status = 'rejected',
          rejected_by = $2,
          rejected_reason = $3,
          rejected_at = NOW(),
          updated_at = NOW()
      WHERE deposit_id = $1
        AND status = 'pending'
      RETURNING *
    `,
    [input.depositId, input.rejectedBy ?? null, normalizeOptionalText(input.reason)]
  );

  if (!result.rows[0]) {
    throw new Error("deposit_not_pending");
  }

  return mapDepositRequest(result.rows[0]);
}

export async function getFinanceOverview() {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<{
    user_count: string;
    total_balances: string;
    pending_deposits_amount: string;
    approved_deposits_amount: string;
    approved_deposits_count: string;
    pending_deposits_count: string;
    rejected_deposits_count: string;
  }>(
    `
      SELECT
        (SELECT COUNT(*)::bigint FROM storefront_auth_users) AS user_count,
        (SELECT COALESCE(SUM(balance), 0)::bigint FROM storefront_auth_users) AS total_balances,
        (SELECT COALESCE(SUM(amount), 0)::bigint FROM storefront_deposit_requests WHERE status = 'pending') AS pending_deposits_amount,
        (SELECT COALESCE(SUM(amount), 0)::bigint FROM storefront_deposit_requests WHERE status = 'approved') AS approved_deposits_amount,
        (SELECT COUNT(*)::bigint FROM storefront_deposit_requests WHERE status = 'approved') AS approved_deposits_count,
        (SELECT COUNT(*)::bigint FROM storefront_deposit_requests WHERE status = 'pending') AS pending_deposits_count,
        (SELECT COUNT(*)::bigint FROM storefront_deposit_requests WHERE status = 'rejected') AS rejected_deposits_count
    `
  );

  const row = result.rows[0];

  return {
    userCount: Number(row.user_count) || 0,
    totalBalances: Number(row.total_balances) || 0,
    pendingDepositsAmount: Number(row.pending_deposits_amount) || 0,
    approvedDepositsAmount: Number(row.approved_deposits_amount) || 0,
    approvedDepositsCount: Number(row.approved_deposits_count) || 0,
    pendingDepositsCount: Number(row.pending_deposits_count) || 0,
    rejectedDepositsCount: Number(row.rejected_deposits_count) || 0
  } satisfies StorefrontFinanceOverview;
}

export async function getStorefrontUserFinanceProfile(userId: string) {
  const user = await getStorefrontUserById(userId);

  if (!user) {
    return null;
  }

  const [recentDeposits, recentLedger, stats] = await Promise.all([
    listDepositRequests({
      userId,
      limit: 12,
      status: "all"
    }),
    listLedgerEntries({
      userId,
      limit: 18
    }),
    queryRowBySql<{
      approved_amount?: number;
      approved_count?: number;
      pending_amount?: number;
      pending_count?: number;
    }>(
      `
        SELECT
          COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) AS approved_amount,
          COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_count,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pending_amount,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count
        FROM storefront_deposit_requests
        WHERE user_id = $1
      `,
      [userId]
    )
  ]);

  return {
    user,
    approvedDepositsAmount: Number(stats?.approved_amount) || 0,
    approvedDepositsCount: Number(stats?.approved_count) || 0,
    pendingDepositsAmount: Number(stats?.pending_amount) || 0,
    pendingDepositsCount: Number(stats?.pending_count) || 0,
    recentDeposits,
    recentLedger
  } satisfies StorefrontUserFinanceProfile;
}

export async function touchUserSeen(userId: string) {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query<StorefrontUserRow>(
    `
      UPDATE storefront_auth_users
      SET last_seen_at = NOW(),
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `,
    [userId]
  );

  if (!result.rows[0]) {
    return null;
  }

  const user = mapUser(result.rows[0]);
  await syncMirror(user);
  return user;
}

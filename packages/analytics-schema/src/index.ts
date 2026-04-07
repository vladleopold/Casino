import type { DeviceType } from "@slotcity/types";

export type TrackingSource = "client" | "server";

export type EventOwner =
  | "product"
  | "growth"
  | "merchandising"
  | "payments"
  | "compliance"
  | "crm"
  | "liveops";

export type ConsentState = "granted" | "denied" | "pending";

export interface EventDefinition {
  channel: "client" | "server" | "either";
  owner: EventOwner;
  description: string;
}

export const eventCatalog = {
  page_viewed: {
    channel: "client",
    owner: "product",
    description: "Canonical page view for storefront routes."
  },
  hero_impression: {
    channel: "client",
    owner: "growth",
    description: "Hero unit rendered in viewport."
  },
  hero_clicked: {
    channel: "client",
    owner: "growth",
    description: "Hero CTA click."
  },
  banner_impression: {
    channel: "client",
    owner: "merchandising",
    description: "Banner rendered or entered viewport."
  },
  banner_clicked: {
    channel: "client",
    owner: "merchandising",
    description: "Banner click or tap."
  },
  shelf_viewed: {
    channel: "client",
    owner: "merchandising",
    description: "Shelf rendered in viewport."
  },
  shelf_scrolled: {
    channel: "client",
    owner: "merchandising",
    description: "Horizontal shelf scrolled."
  },
  game_card_viewed: {
    channel: "client",
    owner: "product",
    description: "Game card rendered or observed."
  },
  game_card_opened: {
    channel: "client",
    owner: "product",
    description: "Game card opened, expanded, or clicked."
  },
  game_card_clicked: {
    channel: "client",
    owner: "product",
    description: "Legacy game card click event."
  },
  search_used: {
    channel: "client",
    owner: "product",
    description: "Search interaction on any storefront surface."
  },
  search_submitted: {
    channel: "client",
    owner: "product",
    description: "Legacy submitted search query."
  },
  filter_changed: {
    channel: "client",
    owner: "product",
    description: "Catalog or live filter changed."
  },
  cta_clicked: {
    channel: "client",
    owner: "growth",
    description: "Generic CTA click."
  },
  session_started: {
    channel: "either",
    owner: "product",
    description: "Session opened for anonymous or authenticated user."
  },
  return_visit: {
    channel: "either",
    owner: "crm",
    description: "Returning user visit stitched to prior session."
  },
  registration_started: {
    channel: "either",
    owner: "growth",
    description: "Registration flow started."
  },
  registration_completed: {
    channel: "server",
    owner: "growth",
    description: "Registration successfully completed."
  },
  kyc_started: {
    channel: "either",
    owner: "compliance",
    description: "KYC flow started."
  },
  kyc_verified: {
    channel: "server",
    owner: "compliance",
    description: "KYC approved and verified."
  },
  kyc_completed: {
    channel: "server",
    owner: "compliance",
    description: "Legacy KYC completed event."
  },
  deposit_started: {
    channel: "server",
    owner: "payments",
    description: "Deposit flow initiated."
  },
  deposit_succeeded: {
    channel: "server",
    owner: "payments",
    description: "Deposit completed successfully."
  },
  deposit_failed: {
    channel: "server",
    owner: "payments",
    description: "Deposit failed."
  },
  withdrawal_requested: {
    channel: "server",
    owner: "payments",
    description: "Withdrawal request submitted."
  },
  bonus_viewed: {
    channel: "client",
    owner: "growth",
    description: "Bonus surface viewed."
  },
  bonus_activated: {
    channel: "server",
    owner: "growth",
    description: "Bonus activated."
  },
  game_launch_started: {
    channel: "either",
    owner: "liveops",
    description: "Game launch requested."
  },
  game_launch_succeeded: {
    channel: "server",
    owner: "liveops",
    description: "Game launch succeeded."
  },
  game_launch_failed: {
    channel: "server",
    owner: "liveops",
    description: "Game launch failed."
  }
} as const satisfies Record<string, EventDefinition>;

export const eventNames = Object.keys(eventCatalog) as Array<keyof typeof eventCatalog>;

export type PlatformEventName = (typeof eventNames)[number];

export const moneyEventNames = [
  "deposit_started",
  "deposit_succeeded",
  "deposit_failed",
  "withdrawal_requested"
] as const;

export const serverOnlyEventNames = eventNames.filter(
  (eventName) => eventCatalog[eventName].channel === "server"
);

export interface EventGeoContext {
  country?: string;
  region?: string;
  city?: string;
}

export interface PlatformEvent {
  event: PlatformEventName;
  source: TrackingSource;
  occurredAt: string;
  sessionId: string;
  anonymousId?: string;
  userId?: string;
  geo?: EventGeoContext;
  locale?: string;
  deviceType?: DeviceType;
  trafficSource?: string;
  campaign?: string;
  bannerId?: string;
  shelfId?: string;
  position?: number;
  gameId?: string;
  providerId?: string;
  experiment?: string;
  variant?: string;
  consentState?: ConsentState;
  properties?: Record<string, unknown>;
}

const blockedPiiPropertyKeys = new Set([
  "address",
  "billing_address",
  "birth_date",
  "card_bin",
  "card_number",
  "city_address",
  "cvc",
  "cvv",
  "date_of_birth",
  "dob",
  "document_number",
  "email",
  "external_email",
  "first_name",
  "full_name",
  "iban",
  "last_name",
  "mobile",
  "mobile_number",
  "national_id",
  "pan",
  "passport_number",
  "phone",
  "phone_number",
  "ssn",
  "street_address",
  "tax_id"
]);

function normalizePropertyKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isLikelyCardOrDocumentNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 12 && digits.length <= 19;
}

function sanitizeUnknownValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (isLikelyEmail(value) || isLikelyCardOrDocumentNumber(value)) {
      return undefined;
    }

    return value;
  }

  if (Array.isArray(value)) {
    const nextValues = value
      .map((entry) => sanitizeUnknownValue(entry))
      .filter((entry) => entry !== undefined);

    return nextValues;
  }

  if (value && typeof value === "object") {
    return sanitizeEventProperties(value as Record<string, unknown>);
  }

  return value;
}

export function sanitizeEventProperties(
  properties?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!properties) {
    return undefined;
  }

  const nextEntries = Object.entries(properties).flatMap(([key, value]) => {
    if (blockedPiiPropertyKeys.has(normalizePropertyKey(key))) {
      return [];
    }

    const sanitizedValue = sanitizeUnknownValue(value);

    if (sanitizedValue === undefined) {
      return [];
    }

    return [[key, sanitizedValue] as const];
  });

  if (nextEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(nextEntries);
}

export function sanitizePlatformEvent(event: PlatformEvent): PlatformEvent {
  return {
    ...event,
    properties: sanitizeEventProperties(event.properties)
  };
}

export function isPlatformEventName(value: string): value is PlatformEventName {
  return eventNames.includes(value as PlatformEventName);
}

export function isServerOnlyEventName(value: PlatformEventName) {
  return serverOnlyEventNames.includes(value);
}

export function isMoneyEventName(value: PlatformEventName) {
  return moneyEventNames.includes(value as (typeof moneyEventNames)[number]);
}

export function canCaptureFromSource(event: PlatformEventName, source: TrackingSource) {
  const channel = eventCatalog[event].channel;

  if (channel === "either") {
    return true;
  }

  return channel === source;
}

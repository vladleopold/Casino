"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import { usePathname } from "next/navigation";

import type {
  ConsentState,
  PlatformEventName
} from "@slotcity/analytics-schema";
import { experimentFlags, featureFlags } from "@slotcity/flags-sdk";
import {
  createHttpAnalyticsAdapter,
  createTracker,
  type TrackerCapturePayload
} from "@slotcity/tracking";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const ENABLE_SESSION_REPLAY = process.env.NEXT_PUBLIC_ENABLE_SESSION_REPLAY !== "false";
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";

const SESSION_ID_STORAGE_KEY = "slotcity.session_id";
const ANONYMOUS_ID_STORAGE_KEY = "slotcity.anonymous_id";
const CONSENT_STATE_STORAGE_KEY = "slotcity.consent_state";

type FeatureState = Record<string, { enabled: boolean; variant?: string }>;

type PosthogClient = {
  init: (apiKey: string, options: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  onFeatureFlags: (callback: (flags: string[]) => void) => () => void;
  isFeatureEnabled: (
    key: string,
    options?: {
      send_event?: boolean;
    }
  ) => boolean | undefined;
  getFeatureFlag: (
    key: string,
    options?: {
      send_event?: boolean;
    }
  ) => boolean | string | undefined;
  opt_in_capturing: (options?: { capture_event_name?: string | false | null }) => void;
  opt_out_capturing: () => void;
  clear_opt_in_out_capturing: () => void;
  set_config: (config: Record<string, unknown>) => void;
  identify: (
    distinctId?: string,
    userPropertiesToSet?: Record<string, unknown>,
    userPropertiesToSetOnce?: Record<string, unknown>
  ) => void;
  __loaded?: boolean;
} | null;

interface BrowserIds {
  anonymousId: string;
  sessionId: string;
}

interface SlotcityAnalyticsContextValue {
  browserIds: BrowserIds | null;
  consentState: ConsentState;
  setConsentState: (nextState: ConsentState) => void;
  capture: (event: PlatformEventName, payload?: TrackerCapturePayload) => Promise<void>;
  isFeatureEnabled: (flagKey: string) => boolean;
  getFeatureVariant: (flagKey: string) => string | undefined;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
}

const SlotcityAnalyticsContext = createContext<SlotcityAnalyticsContextValue>({
  browserIds: null,
  consentState: "pending",
  setConsentState() {},
  async capture() {},
  isFeatureEnabled() {
    return false;
  },
  getFeatureVariant() {
    return undefined;
  },
  identify() {}
});

let posthogClient: PosthogClient = null;

function getOrCreateId(storageKey: string) {
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const nextValue = crypto.randomUUID();
  window.localStorage.setItem(storageKey, nextValue);
  return nextValue;
}

function getOrCreateSessionId() {
  const existing = window.sessionStorage.getItem(SESSION_ID_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const nextValue = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_ID_STORAGE_KEY, nextValue);
  return nextValue;
}

function getStoredConsentState() {
  const stored = window.localStorage.getItem(CONSENT_STATE_STORAGE_KEY);

  if (stored === "granted" || stored === "denied" || stored === "pending") {
    return stored;
  }

  return "pending" as const;
}

function getDeviceType() {
  if (window.innerWidth < 768) {
    return "mobile" as const;
  }

  if (window.innerWidth < 1200) {
    return "tablet" as const;
  }

  return "desktop" as const;
}

function readPosthogFlags(client: NonNullable<PosthogClient>): FeatureState {
  const trackedFlagKeys = [
    ...Object.values(featureFlags),
    ...Object.values(experimentFlags)
  ];

  return Object.fromEntries(
    trackedFlagKeys.map((flagKey) => {
      const variant = client.getFeatureFlag(flagKey, {
        send_event: false
      });

      return [
        flagKey,
        {
          enabled: Boolean(
            client.isFeatureEnabled(flagKey, {
              send_event: false
            }) ?? variant
          ),
          variant: typeof variant === "string" ? variant : undefined
        }
      ];
    })
  );
}

function syncConsentWithPosthog(client: NonNullable<PosthogClient>, consentState: ConsentState) {
  if (consentState === "granted") {
    client.clear_opt_in_out_capturing();
    client.opt_in_capturing({
      capture_event_name: false
    });
    client.set_config({
      disable_session_recording: !ENABLE_SESSION_REPLAY
    });
    return;
  }

  if (consentState === "denied") {
    client.opt_out_capturing();
    client.set_config({
      disable_session_recording: true
    });
    return;
  }

  client.clear_opt_in_out_capturing();
  client.set_config({
    disable_session_recording: true
  });
}

export function SlotcityAnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [browserIds, setBrowserIds] = useState<BrowserIds | null>(null);
  const [consentState, setConsentStateValue] = useState<ConsentState>("pending");
  const [featureState, setFeatureState] = useState<FeatureState>({});
  const [userId, setUserId] = useState<string | undefined>();
  const consentStateRef = useRef<ConsentState>("pending");

  useEffect(() => {
    consentStateRef.current = consentState;
  }, [consentState]);

  useEffect(() => {
    const nextBrowserIds = {
      anonymousId: getOrCreateId(ANONYMOUS_ID_STORAGE_KEY),
      sessionId: getOrCreateSessionId()
    };

    setBrowserIds(nextBrowserIds);
    setConsentStateValue(getStoredConsentState());

    if (POSTHOG_KEY) {
      void import("posthog-js").then(({ default: posthog }) => {
        if (posthogClient?.__loaded) {
          const currentClient = posthogClient;
          syncConsentWithPosthog(currentClient, getStoredConsentState());
          startTransition(() => {
            setFeatureState(readPosthogFlags(currentClient));
          });
          return;
        }

        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: true,
          persistence: "localStorage+cookie",
          person_profiles: "identified_only",
          session_recording: {
            maskAllInputs: true,
            recordCrossOriginIframes: false
          },
          disable_session_recording: true
        });

        posthogClient = posthog as NonNullable<PosthogClient>;
        posthogClient.__loaded = true;
        syncConsentWithPosthog(posthogClient, getStoredConsentState());

        posthogClient.onFeatureFlags(() => {
          startTransition(() => {
            setFeatureState(readPosthogFlags(posthogClient as NonNullable<PosthogClient>));
          });
        });
      });
    }

    if (SENTRY_DSN) {
      void import("@sentry/nextjs").then((Sentry) => {
        Sentry.init({
          dsn: SENTRY_DSN,
          enabled: true,
          environment: process.env.SENTRY_ENVIRONMENT,
          tracesSampleRate: 0.2,
          replaysSessionSampleRate: ENABLE_SESSION_REPLAY ? 0.05 : 0,
          replaysOnErrorSampleRate: 1
        });
      });
    }
  }, []);

  const capture = async (
    event: PlatformEventName,
    payload: TrackerCapturePayload = {}
  ) => {
    if (!browserIds || consentStateRef.current === "denied") {
      return;
    }

    const tracker = createTracker(createHttpAnalyticsAdapter("/api/events"), {
      source: "client",
      sessionId: browserIds.sessionId,
      anonymousId: browserIds.anonymousId,
      userId,
      locale: navigator.language,
      deviceType: getDeviceType(),
      trafficSource: document.referrer || undefined,
      consentState: consentStateRef.current
    });

    await tracker.capture(event, payload);
  };

  useEffect(() => {
    if (!browserIds) {
      return;
    }

    const query = window.location.search.replace(/^\?/, "");

    void capture("page_viewed", {
      properties: {
        path: pathname,
        query: query || undefined
      }
    });
  }, [browserIds, pathname]);

  const setConsentState = (nextState: ConsentState) => {
    setConsentStateValue(nextState);
    consentStateRef.current = nextState;
    window.localStorage.setItem(CONSENT_STATE_STORAGE_KEY, nextState);

    if (posthogClient?.__loaded) {
      syncConsentWithPosthog(posthogClient, nextState);
    }
  };

  const identify = (nextUserId: string, properties?: Record<string, unknown>) => {
    setUserId(nextUserId);

    if (!posthogClient?.__loaded) {
      return;
    }

    posthogClient.identify(nextUserId, properties);
  };

  return (
    <SlotcityAnalyticsContext.Provider
      value={{
        browserIds,
        consentState,
        setConsentState,
        capture,
        isFeatureEnabled(flagKey) {
          return featureState[flagKey]?.enabled ?? false;
        },
        getFeatureVariant(flagKey) {
          return featureState[flagKey]?.variant;
        },
        identify
      }}
    >
      {children}
    </SlotcityAnalyticsContext.Provider>
  );
}

export function useSlotcityAnalytics() {
  return useContext(SlotcityAnalyticsContext);
}

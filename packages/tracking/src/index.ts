import type {
  PlatformEvent,
  PlatformEventName,
  TrackingSource
} from "@slotcity/analytics-schema";

export interface AnalyticsAdapter {
  capture: (event: PlatformEvent) => void | Promise<void>;
}

export interface TrackerDefaults {
  source: TrackingSource;
  sessionId: string;
  anonymousId?: string;
  userId?: string;
  locale?: string;
  deviceType?: PlatformEvent["deviceType"];
  trafficSource?: string;
  campaign?: string;
  consentState?: PlatformEvent["consentState"];
}

export interface TrackerCapturePayload
  extends Omit<PlatformEvent, "event" | "occurredAt" | "source" | "sessionId"> {
  occurredAt?: string;
  sessionId?: string;
}

export function createTracker(adapter: AnalyticsAdapter, defaults: TrackerDefaults) {
  return {
    capture(event: PlatformEventName, payload: TrackerCapturePayload = { sessionId: defaults.sessionId }) {
      const {
        occurredAt,
        sessionId,
        anonymousId,
        userId,
        locale,
        deviceType,
        trafficSource,
        campaign,
        consentState,
        ...rest
      } = payload;

      return adapter.capture({
        event,
        source: defaults.source,
        occurredAt: occurredAt ?? new Date().toISOString(),
        sessionId: sessionId ?? defaults.sessionId,
        anonymousId: anonymousId ?? defaults.anonymousId,
        userId: userId ?? defaults.userId,
        locale: locale ?? defaults.locale,
        deviceType: deviceType ?? defaults.deviceType,
        trafficSource: trafficSource ?? defaults.trafficSource,
        campaign: campaign ?? defaults.campaign,
        consentState: consentState ?? defaults.consentState,
        ...rest
      });
    }
  };
}

export function createHttpAnalyticsAdapter(endpoint: string): AnalyticsAdapter {
  return {
    async capture(event) {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(event)
      });
    }
  };
}

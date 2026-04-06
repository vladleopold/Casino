export type DeviceType = "mobile" | "tablet" | "desktop";

export type AudienceSegment =
  | "guest"
  | "authenticated"
  | "vip"
  | "high_intent"
  | "live_affinity"
  | "slots_affinity";

export interface GeoTarget {
  country: string;
  region?: string;
  city?: string;
}

export interface AudienceTarget {
  locale: string;
  device: DeviceType;
  segment: AudienceSegment;
}

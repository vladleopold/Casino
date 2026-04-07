"use client";

import {
  createElement,
  useEffect,
  useRef,
  type PropsWithChildren
} from "react";

import type { PlatformEventName } from "@slotcity/analytics-schema";
import { useSlotcityAnalytics } from "./analytics-context";

interface FlagSurfaceProps extends PropsWithChildren {
  as?: "div" | "section";
  baseClassName: string;
  flagKey?: string;
  experimentKey?: string;
  enabledClassName?: string;
  variantClassMap?: Record<string, string>;
  exposureEvent?: PlatformEventName;
  surfaceId: string;
}

export function FlagSurface({
  as = "div",
  baseClassName,
  flagKey,
  experimentKey,
  enabledClassName,
  variantClassMap,
  exposureEvent = "hero_impression",
  surfaceId,
  children
}: FlagSurfaceProps) {
  const exposureTrackedRef = useRef(false);
  const { capture, getFeatureVariant, isFeatureEnabled } = useSlotcityAnalytics();
  const variant = getFeatureVariant(experimentKey ?? flagKey ?? "");
  const isEnabled = flagKey
    ? isFeatureEnabled(flagKey)
    : experimentKey
      ? Boolean(variant)
      : false;

  useEffect(() => {
    if (exposureTrackedRef.current || (!isEnabled && !variant)) {
      return;
    }

    exposureTrackedRef.current = true;

    void capture(exposureEvent, {
      experiment: experimentKey ?? flagKey,
      variant: variant ?? (isEnabled ? "enabled" : undefined),
      properties: {
        surface_id: surfaceId
      }
    });
  }, [capture, exposureEvent, experimentKey, flagKey, isEnabled, surfaceId, variant]);

  const classNames = [
    baseClassName,
    isEnabled && enabledClassName ? enabledClassName : "",
    variant && variantClassMap?.[variant] ? variantClassMap[variant] : ""
  ]
    .filter(Boolean)
    .join(" ");

  return createElement(as, { className: classNames }, children);
}

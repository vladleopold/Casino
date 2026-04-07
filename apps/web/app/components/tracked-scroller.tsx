"use client";

import { useRef, type PropsWithChildren } from "react";

import type { TrackerCapturePayload } from "@slotcity/tracking";
import { useSlotcityAnalytics } from "./analytics-context";

interface TrackedScrollerProps extends PropsWithChildren {
  className?: string;
  payload?: TrackerCapturePayload;
}

export function TrackedScroller({
  className,
  payload,
  children
}: TrackedScrollerProps) {
  const hasTrackedScrollRef = useRef(false);
  const { capture } = useSlotcityAnalytics();

  return (
    <div
      className={className}
      onScroll={(event) => {
        if (hasTrackedScrollRef.current) {
          return;
        }

        const currentTarget = event.currentTarget;

        if (currentTarget.scrollLeft <= 0 && currentTarget.scrollTop <= 0) {
          return;
        }

        hasTrackedScrollRef.current = true;
        void capture("shelf_scrolled", payload);
      }}
    >
      {children}
    </div>
  );
}

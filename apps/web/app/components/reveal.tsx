"use client";

import { useRef, type CSSProperties, type PropsWithChildren } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { PlatformEventName } from "@slotcity/analytics-schema";
import type { TrackerCapturePayload } from "@slotcity/tracking";

import { useSlotcityAnalytics } from "./analytics-context";

type RevealDomProps = {
  id?: string;
  style?: CSSProperties;
  title?: string;
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
  "data-block-id"?: string;
  "data-block-name"?: string;
};

interface RevealProps extends PropsWithChildren, RevealDomProps {
  className?: string;
  delay?: number;
  trackView?: {
    event: PlatformEventName;
    payload?: TrackerCapturePayload;
  };
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  trackView,
  ...rest
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const hasTrackedViewportRef = useRef(false);
  const { capture } = useSlotcityAnalytics();

  return (
    <motion.div
      {...rest}
      className={className}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 22 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      onViewportEnter={() => {
        if (!trackView || hasTrackedViewportRef.current) {
          return;
        }

        hasTrackedViewportRef.current = true;
        void capture(trackView.event, trackView.payload);
      }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

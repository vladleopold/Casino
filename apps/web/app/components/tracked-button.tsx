"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import type { PlatformEventName } from "@slotcity/analytics-schema";
import type { TrackerCapturePayload } from "@slotcity/tracking";
import { useSlotcityAnalytics } from "./analytics-context";

interface TrackedButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> {
  children: ReactNode;
  event: PlatformEventName;
  payload?: TrackerCapturePayload;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}

export function TrackedButton({
  children,
  event,
  payload,
  onClick,
  type = "button",
  ...buttonProps
}: TrackedButtonProps) {
  const { capture } = useSlotcityAnalytics();

  return (
    <button
      {...buttonProps}
      type={type}
      onClick={(nextEvent) => {
        void capture(event, payload);
        onClick?.(nextEvent);
      }}
    >
      {children}
    </button>
  );
}

"use client";

import type { MouseEventHandler, ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

import type { PlatformEventName } from "@slotcity/analytics-schema";
import type { TrackerCapturePayload } from "@slotcity/tracking";
import { useSlotcityAnalytics } from "./analytics-context";

interface TrackedLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  event: PlatformEventName;
  payload?: TrackerCapturePayload;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  "aria-label"?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function TrackedLink({
  href,
  className,
  children,
  event: trackedEvent,
  payload,
  target,
  rel,
  ariaLabel,
  "aria-label": ariaLabelProp,
  onClick
}: TrackedLinkProps) {
  const { capture } = useSlotcityAnalytics();
  const resolvedAriaLabel = ariaLabelProp ?? ariaLabel;
  const resolvedHref = typeof href === "string" && href.length > 0 ? href : "/";

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (clickEvent) => {
    void capture(trackedEvent, payload);
    onClick?.(clickEvent);
  };

  if (isExternalHref(resolvedHref) || target === "_blank") {
    return (
      <a
        href={resolvedHref}
        className={className}
        target={target}
        rel={rel}
        aria-label={resolvedAriaLabel}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={resolvedHref as Route}
      className={className}
      aria-label={resolvedAriaLabel}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

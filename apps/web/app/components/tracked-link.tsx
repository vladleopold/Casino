"use client";

import type { ReactNode } from "react";
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
}

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function TrackedLink({
  href,
  className,
  children,
  event,
  payload,
  target,
  rel,
  ariaLabel,
  "aria-label": ariaLabelProp
}: TrackedLinkProps) {
  const { capture } = useSlotcityAnalytics();
  const resolvedAriaLabel = ariaLabelProp ?? ariaLabel;
  const resolvedHref = typeof href === "string" && href.length > 0 ? href : "/";

  const handleClick = () => {
    void capture(event, payload);
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

"use client";

import type { Route } from "next";

import { TrackedLink } from "./tracked-link";

export interface SideRailItem {
  id: string;
  label: string;
  short: string;
  href: string;
}

export function SideRail({
  items,
  route
}: {
  items: SideRailItem[];
  route: string;
}) {
  return (
    <aside className="slotcity-side-rail" aria-label="Швидка навігація">
      {items.map((item) => (
        <TrackedLink
          key={item.id}
          href={item.href as Route}
          className="slotcity-side-rail-item"
          event="cta_clicked"
          payload={{
            properties: {
              route,
              placement: "side_rail",
              label: item.label
            }
          }}
        >
          <span className="slotcity-side-rail-icon">{item.short}</span>
          <span>{item.label}</span>
        </TrackedLink>
      ))}
    </aside>
  );
}

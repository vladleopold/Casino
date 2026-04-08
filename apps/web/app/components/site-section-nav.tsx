"use client";

import type { Route } from "next";

import { TrackedLink } from "./tracked-link";

const navItems: Array<{
  label: string;
  shortLabel?: string;
  href: string;
  match: string[];
  mobileSecondary?: boolean;
}> = [
  { label: "Головна", shortLabel: "Головна", href: "/", match: ["home"] },
  { label: "Слоти", shortLabel: "Слоти", href: "/catalog", match: ["catalog", "slots", "casino"] },
  { label: "Live casino", shortLabel: "Live", href: "/live", match: ["live"] },
  { label: "Бонуси", shortLabel: "Бонуси", href: "/bonuses", match: ["promotions", "bonuses", "registration"] },
  { label: "CITY VIP", shortLabel: "VIP", href: "/vip", match: ["vip"], mobileSecondary: true },
  { label: "Турніри", shortLabel: "Турніри", href: "/tournaments", match: ["tournaments"], mobileSecondary: true }
];

export function SiteSectionNav({ route = "home" }: { route?: string }) {
  return (
    <nav className="slotcity-section-nav" aria-label="Розділи SlotCity">
      {navItems.map((item) => (
        <TrackedLink
          key={item.href}
          href={item.href as Route}
          className={`slotcity-section-nav-link${item.match.includes(route) ? " is-active" : ""}${item.mobileSecondary ? " is-mobile-secondary" : ""}`}
          event="cta_clicked"
          payload={{
            properties: {
              route,
              placement: "section_nav",
              label: item.label
            }
          }}
        >
          <span className="slotcity-section-nav-label-full">{item.label}</span>
          <span className="slotcity-section-nav-label-short">{item.shortLabel ?? item.label}</span>
        </TrackedLink>
      ))}
    </nav>
  );
}

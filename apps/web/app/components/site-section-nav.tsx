"use client";

import type { Route } from "next";

import { TrackedLink } from "./tracked-link";

const navItems: Array<{ label: string; href: string; match: string[] }> = [
  { label: "Головна", href: "/", match: ["home"] },
  { label: "Слоти", href: "/slots", match: ["catalog", "slots", "casino"] },
  { label: "Live casino", href: "/live", match: ["live"] },
  { label: "Бонуси", href: "/bonuses", match: ["promotions", "bonuses", "registration"] },
  { label: "CITY VIP", href: "/vip", match: ["vip"] },
  { label: "Турніри", href: "/tournaments", match: ["tournaments"] }
];

export function SiteSectionNav({ route = "home" }: { route?: string }) {
  return (
    <nav className="slotcity-section-nav" aria-label="Розділи SlotCity">
      {navItems.map((item) => (
        <TrackedLink
          key={item.href}
          href={item.href as Route}
          className={`slotcity-section-nav-link${item.match.includes(route) ? " is-active" : ""}`}
          event="cta_clicked"
          payload={{
            properties: {
              route,
              placement: "section_nav",
              label: item.label
            }
          }}
        >
          {item.label}
        </TrackedLink>
      ))}
    </nav>
  );
}

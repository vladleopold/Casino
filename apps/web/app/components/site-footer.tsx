"use client";

import type { Route } from "next";

import { TrackedLink } from "./tracked-link";

const footerGroups = [
  {
    title: "Казино",
    links: [
      { label: "Головна", href: "/" },
      { label: "Слоти", href: "/slots" },
      { label: "Live casino", href: "/live" }
    ]
  },
  {
    title: "Пропозиції",
    links: [
      { label: "Бонуси", href: "/bonuses" },
      { label: "CITY VIP", href: "/vip" },
      { label: "Турніри", href: "/tournaments" }
    ]
  },
  {
    title: "Акаунт",
    links: [
      { label: "Реєстрація", href: "/registration" },
      { label: "Увійти", href: "/registration?mode=login" },
      { label: "Промо-сторінки", href: "/promotions" }
    ]
  }
] as const;

export function SiteFooter({ route = "home" }: { route?: string }) {
  return (
    <>
      <section className="slotcity-shared-footer">
        <div className="slotcity-shared-footer-lead">
          <span className="slotcity-section-kicker">SlotCity</span>
          <h2>Слоти, live, бонуси та VIP в єдиній навігаційній системі.</h2>
          <p>
            Єдиний футерний блок зводить головні маршрути, бонусні сценарії та вхід до акаунта в один помітний контур.
          </p>
        </div>

        <div className="slotcity-shared-footer-groups">
          {footerGroups.map((group) => (
            <section key={group.title} className="slotcity-shared-footer-group">
              <strong>{group.title}</strong>
              <div className="slotcity-shared-footer-links">
                {group.links.map((link) => (
                  <TrackedLink
                    key={link.href}
                    href={link.href as Route}
                    className="slotcity-shared-footer-link"
                    event="cta_clicked"
                    payload={{
                      properties: {
                        route,
                        placement: "shared_footer",
                        label: link.label
                      }
                    }}
                  >
                    {link.label}
                  </TrackedLink>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="slotcity-shared-footer-meta">
        <span>support@slotcity.ua</span>
        <span>+380630213021</span>
        <span>21+</span>
      </div>
    </>
  );
}

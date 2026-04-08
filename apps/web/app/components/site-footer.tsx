import { getHomeRouteContent } from "@slotcity/cms-sdk";

import { TrackedLink } from "./tracked-link";

export async function SiteFooter({ route = "home" }: { route?: string }) {
  const { footerBrand, footerGroups, footerMeta } = await getHomeRouteContent();

  return (
    <>
      <section className="slotcity-shared-footer">
        <div className="slotcity-shared-footer-lead">
          <span className="slotcity-section-kicker">SlotCity</span>
          <h2>{footerBrand.title}</h2>
          <p>{footerBrand.body}</p>
        </div>

        <div className="slotcity-shared-footer-groups">
          {footerGroups.map((group) => (
            <section key={group.id} className="slotcity-shared-footer-group">
              <strong>{group.title}</strong>
              <div className="slotcity-shared-footer-links">
                {group.links.map((link) => (
                  <TrackedLink
                    key={link.id}
                    href={link.href}
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
        <a href={`mailto:${footerMeta.email}`}>{footerMeta.email}</a>
        <a href={`tel:${footerMeta.phone}`}>{footerMeta.phone}</a>
        <span>{footerMeta.locale}</span>
        <span>{footerMeta.hours}</span>
        <span>{footerMeta.age}</span>
      </div>
    </>
  );
}

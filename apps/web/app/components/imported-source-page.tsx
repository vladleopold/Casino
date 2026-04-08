import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getImportedPagePayload } from "@slotcity/cms-sdk";

import { LayoutShell } from "./layout-shell";
import { MobileDock } from "./mobile-dock";
import { SiteFooter } from "./site-footer";

function inferShellRoute(path: string) {
  if (path.startsWith("/live")) {
    return "live";
  }

  if (
    path.startsWith("/bonuses") ||
    path.startsWith("/promotions") ||
    path.startsWith("/registration") ||
    path.startsWith("/casino-app")
  ) {
    return "bonuses";
  }

  if (
    path.startsWith("/tournaments") ||
    path.startsWith("/raffles") ||
    path.startsWith("/promotions/city-vip") ||
    path.startsWith("/levels")
  ) {
    return "vip";
  }

  return "catalog";
}

function getKicker(type: string) {
  switch (type) {
    case "game":
      return "Top 500 games";
    case "promotion":
      return "Акція SlotCity";
    case "provider":
      return "Провайдер";
    case "collection":
      return "Добірка";
    case "live":
      return "Live casino";
    case "info":
      return "Інформація";
    default:
      return "SlotCity";
  }
}

export async function buildImportedMetadata(sourcePath: string): Promise<Metadata> {
  const page = await getImportedPagePayload(sourcePath);

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      images: page.heroImage ? [{ url: page.heroImage }] : undefined
    }
  };
}

export async function ImportedSourcePage({
  sourcePath,
  route
}: {
  sourcePath: string;
  route?: string;
}) {
  const page = await getImportedPagePayload(sourcePath);

  if (!page) {
    notFound();
  }

  const shellRoute = route ?? page.shellRoute ?? inferShellRoute(page.path);

  return (
    <LayoutShell route={shellRoute}>
      <main className="slotcity-home slotcity-imported-page">
        <div className="slotcity-page-glow slotcity-page-glow-gold" />
        <div className="slotcity-page-glow slotcity-page-glow-green" />

        <section className="slotcity-imported-hero">
          <div className="slotcity-imported-hero-copy">
            {page.breadcrumbs.length ? (
              <nav className="slotcity-imported-breadcrumbs" aria-label="Breadcrumbs">
                {page.breadcrumbs.map((item, index) => (
                  <span key={`${item.href}-${item.label}`}>
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    <a href={item.href}>{item.label}</a>
                  </span>
                ))}
              </nav>
            ) : null}

            <span className="slotcity-section-kicker">
              {page.kicker ?? getKicker(page.pageType)}
            </span>
            <h1>{page.heading}</h1>
            {page.description ? <p>{page.description}</p> : null}

            <div className="slotcity-imported-meta">
              <span>{page.locale === "ru" ? "RU" : "UA"}</span>
              {page.pageType === "game" ? <span>Top 500</span> : null}
              <a href={page.sourceUrl} target="_blank" rel="noreferrer">
                Джерело
              </a>
            </div>
          </div>

          {page.heroImage ? (
            <div className="slotcity-imported-hero-media">
              <img src={page.heroImage} alt={page.heading} />
            </div>
          ) : null}
        </section>

        <section className="slotcity-imported-content-shell">
          <div
            className="slotcity-imported-html"
            dangerouslySetInnerHTML={{ __html: page.html }}
          />
        </section>

        <SiteFooter route={shellRoute} />
        <MobileDock />
      </main>
    </LayoutShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getStorefrontGamePage } from "@slotcity/cms-sdk";

import { GameLauncher } from "../../components/game-launcher";
import { LayoutShell } from "../../components/layout-shell";
import { MobileDock } from "../../components/mobile-dock";
import { Reveal } from "../../components/reveal";
import { SiteFooter } from "../../components/site-footer";
import { TrackedGameCard } from "../../components/tracked-game-card";
import { TrackedLink } from "../../components/tracked-link";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getStorefrontGamePage(slug);

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

export default async function GameDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getStorefrontGamePage(slug);

  if (!page) {
    notFound();
  }

  const shellRoute = page.gameType === "live" ? "live" : "catalog";

  return (
    <LayoutShell route={shellRoute}>
      <main className="slotcity-home slotcity-game-page">
        <div className="slotcity-page-glow slotcity-page-glow-gold" />
        <div className="slotcity-page-glow slotcity-page-glow-green" />

        <section className="slotcity-game-shell">
          <Reveal className="slotcity-game-breadcrumbs" delay={0.02}>
            <TrackedLink
              href="/"
              className="slotcity-game-breadcrumb-link"
              event="cta_clicked"
              payload={{ properties: { route: "game", placement: "breadcrumb_home", slug } }}
            >
              Головна
            </TrackedLink>
            <span>/</span>
            <TrackedLink
              href={page.gameType === "live" ? "/live" : "/catalog"}
              className="slotcity-game-breadcrumb-link"
              event="cta_clicked"
              payload={{ properties: { route: "game", placement: "breadcrumb_catalog", slug } }}
            >
              {page.gameType === "live" ? "Live casino" : "Каталог"}
            </TrackedLink>
            <span>/</span>
            <span>{page.name}</span>
          </Reveal>

          <section className="slotcity-game-hero">
            <Reveal className="slotcity-game-copy" delay={0.04}>
              <span className="slotcity-section-kicker">{page.kicker}</span>
              <h1>{page.heading}</h1>
              <p>{page.description}</p>

              <div className="slotcity-game-badges">
                {page.badges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
                {page.provider ? <span>{page.provider}</span> : null}
              </div>

              {page.highlights.length ? (
                <div className="slotcity-game-highlights">
                  {page.highlights.map((item) => (
                    <article key={item} className="slotcity-game-highlight-card">
                      <span className="slotcity-game-highlight-kicker">Швидко</span>
                      <strong>{item}</strong>
                    </article>
                  ))}
                </div>
              ) : null}
            </Reveal>

            <Reveal className={`slotcity-game-launch-shell accent-${page.accent}`} delay={0.08}>
              <GameLauncher
                slug={page.slug}
                title={page.name}
                provider={page.provider}
                heroImage={page.heroImage}
                launch={page.launch}
              />
            </Reveal>
          </section>

          <Reveal className="slotcity-game-facts-grid" delay={0.1}>
            {page.facts.map((fact) => (
              <article key={`${fact.label}-${fact.value}`} className="slotcity-game-fact-card">
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </article>
            ))}
          </Reveal>

          {page.contentHtml ? (
            <Reveal className="slotcity-game-editorial" delay={0.12}>
              <div
                className="slotcity-imported-html slotcity-game-editorial-html"
                dangerouslySetInnerHTML={{ __html: page.contentHtml }}
              />
            </Reveal>
          ) : null}

          {page.relatedGames.length ? (
            <Reveal className="slotcity-section slotcity-game-related" delay={0.14}>
              <div className="slotcity-section-head">
                <h2>Схожі ігри</h2>
                <TrackedLink
                  href={page.gameType === "live" ? "/live" : "/catalog"}
                  className="slotcity-inline-link"
                  event="cta_clicked"
                  payload={{
                    properties: {
                      route: "game",
                      placement: "related_games_header",
                      slug
                    }
                  }}
                >
                  Усі
                </TrackedLink>
              </div>
              <div className="slotcity-game-grid">
                {page.relatedGames.map((game, index) => (
                  <TrackedGameCard
                    key={game.id}
                    title={game.title}
                    provider={game.provider}
                    image={game.image}
                    gameId={game.id}
                    shelfId={`game_related_${page.slug}`}
                    position={index + 1}
                  />
                ))}
              </div>
            </Reveal>
          ) : null}

          <SiteFooter route={shellRoute} />
          <MobileDock />
        </section>
      </main>
    </LayoutShell>
  );
}

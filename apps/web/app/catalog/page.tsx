import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { getCatalogPageData, getCatalogRouteContent } from "@slotcity/cms-sdk";
import { experimentFlags } from "@slotcity/flags-sdk";
import { FlagSurface } from "../components/flag-surface";
import { Reveal } from "../components/reveal";
import { TrackedGameCard } from "../components/tracked-game-card";
import { TrackedLink } from "../components/tracked-link";
import { TrackedScroller } from "../components/tracked-scroller";
import { GameHall } from "../components/game-hall";
import { LayoutShell } from "../components/layout-shell";
import { MobileDock } from "../components/mobile-dock";
import { SideRail } from "../components/side-rail";
import { SiteFooter } from "../components/site-footer";

const sideRailItems = [
  { id: "bonus", label: "Бонуси", short: "B" },
  { id: "top", label: "ТОП", short: "T" },
  { id: "live", label: "Live", short: "L" },
  { id: "apps", label: "App", short: "A" }
] as const;

function MiniGamePill({ title, image }: { title: string; image: string }) {
  return (
    <div className="slotcity-mini-pill">
      <div className="slotcity-mini-pill-media">
        <Image src={image} alt={title} fill sizes="64px" />
      </div>
      <span>{title}</span>
    </div>
  );
}

function HeroDots() {
  return (
    <div className="slotcity-hero-dots" aria-hidden="true">
      <span className="is-active" />
      <span />
      <span />
    </div>
  );
}

export default async function CatalogPage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.category || "all";

  const [page, routeContent] = await Promise.all([
    getCatalogPageData(),
    getCatalogRouteContent()
  ]);
  const {
    heroPromos,
    topSlots,
    discoveryGames,
    bonusGames,
    liveGames,
    quickPicks,
    monthlyTop,
    providerHighlights,
    footerSignals
  } = routeContent;

  return (
    <LayoutShell route="catalog">
      <main className="slotcity-home slotcity-catalog-page">
      <div className="slotcity-page-glow slotcity-page-glow-gold" />
      <div className="slotcity-page-glow slotcity-page-glow-green" />

      <SideRail
        route="catalog"
        items={sideRailItems.map((item) => ({
          ...item,
          href:
            item.id === "bonus"
              ? "/bonuses"
              : item.id === "top"
                ? "/catalog"
                : item.id === "live"
                  ? "/live"
                  : "/registration"
        }))}
      />

      <Reveal
        className="slotcity-promo-strip"
        delay={0.02}
        trackView={{
          event: "banner_impression",
          payload: {
            bannerId: "catalog_promo_strip",
            properties: {
              route: "catalog"
            }
          }
        }}
      >
        {heroPromos.map((promo) => (
          <TrackedLink
            key={promo.id}
            href={promo.href}
            className="slotcity-promo-card"
            event="banner_clicked"
            payload={{
              bannerId: promo.id,
              properties: {
                route: "catalog",
                title: promo.title
              }
            }}
          >
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              sizes="(max-width: 920px) 100vw, 380px"
              className="slotcity-promo-card-image"
            />
            <div className="slotcity-promo-card-overlay" />
            <div className="slotcity-promo-card-content">
              <span>{promo.kicker}</span>
              <strong>{promo.title}</strong>
            </div>
          </TrackedLink>
        ))}
      </Reveal>

      <FlagSurface
        as="section"
        baseClassName="slotcity-hero-grid slotcity-catalog-hero-grid"
        experimentKey={experimentFlags.catalogCards}
        enabledClassName="slotcity-hero-grid-experiment"
        surfaceId="catalog_hero"
      >
        <Reveal className="slotcity-hero-card slotcity-hero-card-primary">
          <Image
            src="/slotcity/assets/hero-card-live.webp"
            alt="Каталог слотів"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 760px"
            className="slotcity-hero-image"
          />
          <div className="slotcity-hero-overlay" />
          <div className="slotcity-hero-copy">
            <span className="slotcity-section-kicker">{page.hero.kicker}</span>
            <h1>{page.hero.title}</h1>
            <p>{page.hero.body}</p>
            <div className="slotcity-hero-actions">
              {page.hero.actions.map((action) => (
                <TrackedLink
                  key={action.id}
                  href={action.href as Route}
                  className={
                    action.variant === "primary"
                      ? "slotcity-cta slotcity-cta-primary"
                      : "slotcity-cta slotcity-cta-secondary"
                  }
                  event="cta_clicked"
                  payload={{
                    experiment: experimentFlags.catalogCards,
                    properties: {
                      route: "catalog",
                      placement: "hero_action",
                      label: action.label
                    }
                  }}
                >
                  {action.label}
                </TrackedLink>
              ))}
            </div>
            <div className="slotcity-chip-row">
              {page.hero.chips.slice(0, 4).map((chip) => (
                <span key={chip.id}>{chip.label}</span>
              ))}
            </div>
            <HeroDots />
          </div>
        </Reveal>

        <Reveal className="slotcity-hero-card slotcity-catalog-console" delay={0.08}>
          <Image
            src="/slotcity/assets/promos/city-vip-slider.webp"
            alt="Пошук і добірки слотів"
            fill
            sizes="(max-width: 1024px) 100vw, 460px"
            className="slotcity-hero-image"
          />
          <div className="slotcity-hero-overlay slotcity-hero-overlay-secondary" />
          <div className="slotcity-catalog-console-copy">
            <div className="slotcity-catalog-console-topline">
              <span className="slotcity-section-kicker">{page.console.label}</span>
              <span className="slotcity-catalog-console-pill">{page.console.badge}</span>
            </div>
            <div className="slotcity-catalog-search-shell">
              <span>{page.console.searchPlaceholder}</span>
              <strong>{page.console.searchShortcut}</strong>
            </div>
            <TrackedScroller
              className="slotcity-catalog-filter-scroller"
              payload={{
                shelfId: "catalog_console_filters"
              }}
            >
              {page.console.chips.map((chip) => (
                <span
                  key={chip.id}
                  className={`slotcity-catalog-filter-chip ${chip.active ? "is-active" : ""}`.trim()}
                >
                  {chip.label}
                </span>
              ))}
            </TrackedScroller>
            <div className="slotcity-catalog-metric-grid">
              {page.console.footerCards.map((card) => (
                <article key={card.id} className="slotcity-catalog-metric-card">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </FlagSurface>

      <Reveal
        className="slotcity-section"
        delay={0.08}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "catalog_game_hall"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>Ігровий зал</h2>
          <TrackedLink href="/slots" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "catalog", placement: "game_hall_header" } }}>Усі</TrackedLink>
        </div>
        <GameHall slots={topSlots} live={liveGames} bonus={bonusGames} />
      </Reveal>

      <Reveal className="slotcity-banner-strip" delay={0.1}>
        <Image
          src="/slotcity/assets/tournaments/lucky-season-promo-desktop.webp"
          alt="Lucky Season promo"
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="slotcity-banner-art"
        />
        <div className="slotcity-banner-copy">
          <span className="slotcity-section-kicker">Знову тут</span>
          <h2>У столиці розваг</h2>
          <p>
            Discovery layer тепер виглядає як справжня витрина SlotCity: живі банери, щільні
            ряди та швидкий перехід у слот без технічної порожнечі.
          </p>
        </div>
        <div className="slotcity-banner-tags">
          <span>GO</span>
          <span>Roulette</span>
          <span>Live</span>
          <span>Top</span>
        </div>
      </Reveal>

      <Reveal
        className="slotcity-section"
        delay={0.12}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "catalog_discovery"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>У столиці розваг</h2>
          <TrackedLink href="/promotions" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "catalog", placement: "discovery_header" } }}>Деталі</TrackedLink>
        </div>
        <p className="slotcity-catalog-section-note">
          Онлайн казино SlotCity це популярні слоти, live-ігри, бонусні добірки та знайомі
          банери без довгого пошуку.
        </p>
        <div className="slotcity-game-grid">
          {discoveryGames.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="catalog_discovery"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <Reveal className="slotcity-partner-banner" delay={0.14}>
        <Image
          src="/slotcity/assets/tournaments/spinjoy-spring-desktop.webp"
          alt="Партнерські банери"
          fill
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="slotcity-partner-art"
        />
        <div className="slotcity-partner-copy">
          <span className="slotcity-section-kicker">Партнери</span>
          <h2>Партнерські банери, промо-тижні та добірки ігор.</h2>
          <p>
            Тут збираються банери провайдерів, сезонні промо та тематичні добірки, щоб швидше
            знаходити знайомі ігри та новинки.
          </p>
          <div className="slotcity-provider-pills">
            {providerHighlights.map((provider) => (
              <span key={provider}>{provider}</span>
            ))}
          </div>
        </div>
        <TrackedLink href="/tournaments" className="slotcity-partner-accent" event="cta_clicked" payload={{ properties: { route: "catalog", placement: "partner_banner" } }}>
          <span>Промо-тижні</span>
          <span>Деталі</span>
        </TrackedLink>
      </Reveal>

      <Reveal
        className="slotcity-mini-shelf"
        delay={0.16}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "catalog_quick_picks"
          }
        }}
      >
        <TrackedScroller
          className="slotcity-mini-shelf-track"
          payload={{
            shelfId: "catalog_quick_picks"
          }}
        >
          {quickPicks.map((game) => (
            <MiniGamePill key={game.id} title={game.title} image={game.image} />
          ))}
        </TrackedScroller>
      </Reveal>

      <Reveal
        className="slotcity-section"
        delay={0.18}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "catalog_live"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>Live casino</h2>
          <TrackedLink href="/live" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "catalog", placement: "catalog_live_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-live-grid">
          {liveGames.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="catalog_live"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <Reveal
        className="slotcity-section"
        delay={0.2}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "catalog_bonus"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>Ігри для відіграшу бонусів</h2>
          <TrackedLink href="/bonuses" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "catalog", placement: "catalog_bonus_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-game-grid">
          {bonusGames.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              gameId={game.id}
              shelfId="catalog_bonus"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <Reveal
        className="slotcity-section"
        delay={0.22}
        trackView={{
          event: "shelf_viewed",
          payload: {
            shelfId: "catalog_monthly_top"
          }
        }}
      >
        <div className="slotcity-section-head">
          <h2>ТОП 10 місяця</h2>
          <TrackedLink href="/slots" className="slotcity-inline-link" event="cta_clicked" payload={{ properties: { route: "catalog", placement: "catalog_monthly_header" } }}>Усі</TrackedLink>
        </div>
        <div className="slotcity-game-grid slotcity-game-grid-ranked">
          {monthlyTop.map((game, index) => (
            <TrackedGameCard
              key={game.id}
              title={game.title}
              provider={game.provider}
              image={game.image}
              rank={game.rank}
              gameId={game.id}
              shelfId="catalog_monthly_top"
              position={index + 1}
            />
          ))}
        </div>
      </Reveal>

      <SiteFooter route="catalog" />
      <MobileDock />
    </main>
    </LayoutShell>
  );
}

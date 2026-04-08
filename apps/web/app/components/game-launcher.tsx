"use client";

import { useState } from "react";
import Image from "next/image";

import type { StorefrontGameLaunchContent } from "@slotcity/cms-sdk";

import { TrackedLink } from "./tracked-link";

interface GameLauncherProps {
  slug: string;
  title: string;
  provider: string;
  heroImage?: string;
  launch: StorefrontGameLaunchContent;
}

type LaunchTab = "demo" | "real";

function resolveDefaultTab(launch: StorefrontGameLaunchContent): LaunchTab {
  if (launch.demoUrl) {
    return "demo";
  }

  return "real";
}

export function GameLauncher({
  slug,
  title,
  provider,
  heroImage,
  launch
}: GameLauncherProps) {
  const [activeTab, setActiveTab] = useState<LaunchTab>(() => resolveDefaultTab(launch));
  const realHref = launch.launchUrl || `/registration?game=${slug}`;
  const demoHref = launch.demoUrl;
  const activeIframeHref =
    activeTab === "demo" ? demoHref || realHref : realHref || demoHref || `/registration?game=${slug}`;
  const canEmbed = launch.mode === "iframe" && Boolean(activeIframeHref);
  const externalTarget = launch.openInNewTab || launch.mode === "external" ? "_blank" : undefined;
  const externalRel = externalTarget === "_blank" ? "noreferrer" : undefined;

  return (
    <section className="slotcity-game-launcher">
      <div className="slotcity-game-launcher-surface">
        {canEmbed ? (
          <>
            <div className="slotcity-game-launcher-tabs" role="tablist" aria-label="Режим гри">
              {demoHref ? (
                <button
                  type="button"
                  className={`slotcity-game-launcher-tab${activeTab === "demo" ? " is-active" : ""}`}
                  onClick={() => setActiveTab("demo")}
                >
                  {launch.demoLabel}
                </button>
              ) : null}
              <button
                type="button"
                className={`slotcity-game-launcher-tab${activeTab === "real" ? " is-active" : ""}`}
                onClick={() => setActiveTab("real")}
              >
                {launch.launchLabel}
              </button>
            </div>
            <div className="slotcity-game-launcher-embed">
              <iframe
                src={activeIframeHref}
                title={`${title} launcher`}
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </>
        ) : (
          <div className="slotcity-game-launcher-preview">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={title}
                fill
                sizes="(max-width: 920px) 100vw, 640px"
                className="slotcity-game-launcher-preview-image"
              />
            ) : null}
            <div className="slotcity-game-launcher-preview-overlay" />
            <div className="slotcity-game-launcher-preview-copy">
              <span className="slotcity-section-kicker">{provider || "SlotCity"}</span>
              <strong>{title}</strong>
              <p>
                {demoHref
                  ? "Демо вже доступне через кнопку нижче. Реальний launcher також можна підключити в Directus."
                  : "Підключіть demo URL або real-money launcher у Directus, і ця зона почне відкривати гру прямо на сторінці."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="slotcity-game-launcher-actions">
        <TrackedLink
          href={realHref}
          className="slotcity-cta slotcity-cta-primary"
          event="cta_clicked"
          payload={{
            properties: {
              route: "game",
              placement: "game_launcher_real",
              slug,
              label: launch.launchLabel
            }
          }}
          target={externalTarget}
          rel={externalRel}
        >
          {launch.launchLabel}
        </TrackedLink>
        {demoHref ? (
          <TrackedLink
            href={demoHref}
            className="slotcity-cta slotcity-cta-secondary"
            event="cta_clicked"
            payload={{
              properties: {
                route: "game",
                placement: "game_launcher_demo",
                slug,
                label: launch.demoLabel
              }
            }}
            target={externalTarget ?? "_blank"}
            rel="noreferrer"
          >
            {launch.demoLabel}
          </TrackedLink>
        ) : null}
      </div>
    </section>
  );
}
